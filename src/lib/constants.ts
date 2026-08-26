export const BRANDS = [
  "apple",
  "samsung",
  "xiaomi",
  "google",
  "oneplus",
  "huawei",
  "honor",
  "nothing",
] as const;

export const STORAGE_OPTIONS = [64, 128, 256, 512, 1024] as const;

export const CONDITIONS = [
  "new",
  "like_new",
  "excellent",
  "good",
  "used_traces",
] as const;

export const LISTING_STATUSES = [
  "pending_moderation",
  "published",
  "sold",
  "rejected",
  "unpublished",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const BATTERY_BANDS = [
  { key: "95_100", min: 95, max: 100 },
  { key: "90_94", min: 90, max: 94 },
  { key: "85_89", min: 85, max: 89 },
  { key: "below_85", min: 0, max: 84 },
] as const;
