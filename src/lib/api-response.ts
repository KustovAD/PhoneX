import { NextResponse } from "next/server";

const ERRORS: Record<string, string> = {
  Forbidden: "Недостаточно прав",
  FORBIDDEN: "Недостаточно прав",
  Unauthorized: "Нужно войти в аккаунт",
  UNAUTHORIZED: "Нужно войти в аккаунт",
  "Invalid data": "Некорректные данные",
  "Not found": "Не найдено",
  NOT_FOUND: "Не найдено",
  "Too many requests": "Слишком много запросов. Попробуйте позже",
  "No files": "Файлы не выбраны",
  "Upload failed": "Не удалось загрузить файл",
  "Model not found": "Модель не найдена",
  MODEL_NOT_FOUND: "Модель не найдена",
  "User already exists": "Пользователь уже существует",
  USER_EXISTS: "Пользователь уже существует",
  "Unable to register": "Не удалось зарегистрироваться",
  "Invalid token": "Недействительный токен",
  INVALID_TOKEN: "Недействительный токен",
  "Unknown action": "Неизвестное действие",
  Error: "Что-то пошло не так",
  NOT_PURCHASED: "Чтобы оставить отзыв, нужен завершённый заказ",
  PRODUCT_UNAVAILABLE: "Товар недоступен",
  OUT_OF_STOCK: "Нет в наличии",
  BRAND_NOT_FOUND: "Бренд не найден",
  ROLE_MISSING: "Роль не найдена",
};

export function publicError(message: string) {
  return ERRORS[message] ?? message;
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: publicError(message), details }, { status });
}
