import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

export class StorageError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export interface StoredFile {
  url: string;
  filename: string;
}

function assertSafeFile(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new StorageError("Файл слишком большой. Максимум 8 МБ.", 413);
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new StorageError("Неподдерживаемый тип файла.", 415);
  }
}

export async function saveUpload(file: File, folder: string): Promise<StoredFile> {
  assertSafeFile(file);
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/heic" || file.type === "image/heif"
          ? "heic"
          : "jpg";
  const filename = `${nanoid()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${folder}/${filename}`, filename };
}
