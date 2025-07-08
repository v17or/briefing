import { PrismaClient } from '@prisma/client'

declare global {
  // Evita múltiplas instâncias do Prisma no ambiente de desenvolvimento
  // @ts-ignore
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['query'], // opcional, útil para debug
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma