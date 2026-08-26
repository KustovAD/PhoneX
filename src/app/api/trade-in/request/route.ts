import { jsonError, jsonOk } from "@/lib/api-response";
import { tradeInEvaluateSchema } from "@/lib/validations";
import { tradeInValuationService } from "@/services/trade-in-valuation.service";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/db/prisma";
import { bonusService } from "@/services/bonus.service";
import { notificationService } from "@/services/notification.service";
import { formatPrice } from "@/lib/format";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = tradeInEvaluateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid data", 400);
  const user = await getCurrentUser();
  const valuation = await tradeInValuationService.evaluate(parsed.data);
  const model = await prisma.phoneModel.findFirst({
    where: { slug: parsed.data.modelSlug },
  });

  const request = await prisma.tradeInRequest.create({
    data: {
      userId: user?.id,
      status: "submitted",
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      brandSlug: parsed.data.brandSlug,
      modelSlug: parsed.data.modelSlug,
      modelName: model?.name ?? parsed.data.modelSlug,
      storageGb: parsed.data.storageGb,
      year: model?.year ?? new Date().getFullYear(),
      conditions: {
        create: {
          batteryHealth: parsed.data.batteryHealth,
          screen: parsed.data.screen,
          body: parsed.data.body,
          cameras: parsed.data.cameras,
          biometrics: parsed.data.biometrics,
          speakers: parsed.data.speakers,
          charging: parsed.data.charging,
          repairsJson: JSON.stringify(parsed.data.repairs),
          kitJson: JSON.stringify(parsed.data.kit),
        },
      },
      valuation: {
        create: {
          basePrice: valuation.basePrice,
          estimatedMin: valuation.estimatedMin,
          estimatedMax: valuation.estimatedMax,
          estimated: valuation.estimated,
          breakdownJson: JSON.stringify(valuation.breakdown),
        },
      },
    },
    include: { valuation: true, conditions: true },
  });

  if (user?.id) {
    await bonusService.onTradeIn(user.id, request.modelName);
    await notificationService.create(user.id, "tradein_valuation", {
      price: String(valuation.estimated),
    });
  }

  return jsonOk(request, 201);
}

void formatPrice;
