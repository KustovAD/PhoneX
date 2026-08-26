import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  image?: string | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  colorHex: string;
  quantity: number;
};

export type BreakdownLine = {
  key: string;
  labelRu: string;
  labelEn: string;
  amount: number;
};

export type ValuationResult = {
  basePrice: number;
  estimated: number;
  estimatedMin: number;
  estimatedMax: number;
  breakdown: BreakdownLine[];
};
