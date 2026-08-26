import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: z.string().trim().email(),
    phone: z.string().trim().min(10).max(20),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(1),
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(10).max(20),
  city: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(400).optional(),
});

export const listingSchema = z.object({
  brandId: z.string().min(1),
  model: z.string().trim().min(1).max(80),
  version: z.string().trim().max(80).optional(),
  storageGb: z.coerce.number().int().positive(),
  color: z.string().trim().min(1).max(40),
  imei: z.string().trim().min(14).max(16),
  region: z.string().trim().max(40).optional(),
  purchaseDate: z.string().optional(),
  condition: z.enum(["new", "like_new", "excellent", "good", "used_traces"]),
  batteryHealth: z.coerce.number().int().min(1).max(100),
  chargeCycles: z.coerce.number().int().min(0).optional(),
  defects: z.record(z.string(), z.boolean()).default({}),
  kit: z.array(z.string()).default([]),
  price: z.coerce.number().int().min(1000),
  images: z.array(z.string()).min(1),
});

export const checkoutSchema = z.object({
  contactName: z.string().trim().min(2),
  contactPhone: z.string().trim().min(10),
  contactEmail: z.string().trim().email(),
  address: z.string().trim().min(8),
  comment: z.string().trim().max(400).optional(),
  bonusToUse: z.coerce.number().int().min(0).default(0),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().min(1).max(5),
      }),
    )
    .min(1),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(1000),
});

export const tradeInEvaluateSchema = z.object({
  brandSlug: z.string(),
  modelSlug: z.string(),
  storageGb: z.coerce.number().int(),
  batteryHealth: z.coerce.number().int().min(1).max(100),
  screen: z.string(),
  body: z.string(),
  cameras: z.string(),
  biometrics: z.string(),
  speakers: z.string(),
  charging: z.string(),
  repairs: z.array(z.string()).default([]),
  kit: z.array(z.string()).default([]),
});

export const productFilterSchema = z.object({
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  storage: z.string().optional(),
  condition: z.string().optional(),
  battery: z.string().optional(),
  color: z.string().optional(),
  inStock: z.string().optional(),
  sort: z.string().optional(),
  q: z.string().optional(),
  featured: z.string().optional(),
  page: z.coerce.number().optional(),
});
