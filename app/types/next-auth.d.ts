
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "PARTICIPANT"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "ADMIN" | "PARTICIPANT"
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "PARTICIPANT"
  }
}
