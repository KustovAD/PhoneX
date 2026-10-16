# PhoneX

Премиальный интернет-магазин смартфонов: каталог, Trade-in, объявления пользователей, бонусы и админ-панель.

## Стек

- Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui
- Prisma · SQLite (локально) / PostgreSQL (продакшен)
- Auth.js (NextAuth) · Zod · React Hook Form · next-intl (RU/EN)

## Быстрый старт

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Откройте [http://localhost:3000/ru](http://localhost:3000/ru)

## Тестовые аккаунты

Пароль у всех: `PhoneX123!`

| Роль | Email |
|---|---|
| Пользователь | user@phonex.ru |
| Продавец | seller@phonex.ru |
| Модератор | moderator@phonex.ru |
| Администратор | admin@phonex.ru |

## Деплой на Vercel

1. Импортируйте репозиторий на [vercel.com/new](https://vercel.com/new).
2. **Storage → Create Database → Neon** — подключите к проекту (Vercel сам добавит `DATABASE_URL`).
3. **Settings → Environment Variables** — добавьте `AUTH_SECRET` (случайная строка 32+ символов, `openssl rand -base64 32`).
4. Для загрузки фото: **Storage → Create → Blob** (добавит `BLOB_READ_WRITE_TOKEN`).
5. Redeploy. Миграции применяются при сборке, а пустая база автоматически заполняется демо-данными
   (отключить: `SKIP_AUTO_SEED=1`). Если переменных не хватает, сборка остановится с понятным сообщением.

## PostgreSQL

Для продакшена замените `DATABASE_URL` в `.env` на PostgreSQL и смените `provider` в `prisma/schema.prisma` на `postgresql`. Пример:

```
DATABASE_URL="postgresql://phonex:phonex@localhost:5432/phonex"
```

Затем:

```bash
npx prisma db push
npx prisma db seed
```
