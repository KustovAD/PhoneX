import { prisma } from "@/db/prisma";
import type { BreakdownLine, ValuationResult } from "@/types";
import { tradeInEvaluateSchema } from "@/lib/validations";
import type { z } from "zod";

type EvaluateInput = z.infer<typeof tradeInEvaluateSchema>;

function batteryKey(health: number) {
  if (health >= 95) return "battery_95_100";
  if (health >= 90) return "battery_90_94";
  if (health >= 85) return "battery_85_89";
  return "battery_below_85";
}

export class TradeInValuationService {
  async evaluate(input: EvaluateInput): Promise<ValuationResult> {
    const model = await prisma.phoneModel.findFirst({
      where: { slug: input.modelSlug, brand: { slug: input.brandSlug } },
      include: { brand: true },
    });

    if (!model) {
      throw new Error("MODEL_NOT_FOUND");
    }

    const coeffs = await prisma.tradeInCoefficient.findMany();
    const byKey = new Map(coeffs.map((item) => [item.key, item]));

    let price = model.basePrice;
    const breakdown: BreakdownLine[] = [
      {
        key: "base",
        labelRu: "Базовая стоимость",
        labelEn: "Base value",
        amount: model.basePrice,
      },
    ];

    const applyMultiplier = (key: string, fallback = 1) => {
      const coeff = byKey.get(key);
      const multiplier = coeff?.multiplier ?? fallback;
      const delta = Math.round(model.basePrice * (multiplier - 1));
      price = Math.round(price * multiplier);
      if (delta !== 0 && coeff) {
        breakdown.push({
          key,
          labelRu: coeff.labelRu,
          labelEn: coeff.labelEn,
          amount: delta,
        });
      }
    };

    const applyDeduction = (key: string) => {
      const coeff = byKey.get(key);
      if (!coeff) return;
      const amount = coeff.deduction ?? 0;
      if (amount !== 0) {
        price += amount;
        breakdown.push({
          key,
          labelRu: coeff.labelRu,
          labelEn: coeff.labelEn,
          amount,
        });
      }
    };

    applyMultiplier(`storage_${input.storageGb}`, 1);
    applyMultiplier(batteryKey(input.batteryHealth), 1);
    applyDeduction(`screen_${input.screen}`);
    applyDeduction(`body_${input.body}`);
    applyDeduction(`cameras_${input.cameras}`);
    applyDeduction(`biometrics_${input.biometrics}`);
    applyDeduction(`speakers_${input.speakers}`);
    applyDeduction(`charging_${input.charging}`);

    for (const repair of input.repairs) {
      applyDeduction(`repair_${repair}`);
    }

    const kitKeys = ["box", "cable", "charger", "documents"];
    for (const key of kitKeys) {
      if (!input.kit.includes(key)) {
        applyDeduction(`missing_${key}`);
      }
    }

    const demand = Math.min(1, (model.demandScore || 1) * (model.brand.demandScore || 1));
    if (demand !== 1) {
      const before = price;
      price = Math.round(price * demand);
      breakdown.push({
        key: "demand",
        labelRu: "Спрос на модель",
        labelEn: "Model demand",
        amount: price - before,
      });
    }

    const floor = Math.round(model.basePrice * 0.18);
    const estimated = Math.max(floor, price);
    if (estimated !== price) {
      breakdown.push({
        key: "floor",
        labelRu: "Минимальная оценка",
        labelEn: "Minimum estimate",
        amount: estimated - price,
      });
    }

    return {
      basePrice: model.basePrice,
      estimated,
      estimatedMin: Math.round(estimated * 0.94),
      estimatedMax: Math.round(estimated * 1.06),
      breakdown,
    };
  }
}

export const tradeInValuationService = new TradeInValuationService();
