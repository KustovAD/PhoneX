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
