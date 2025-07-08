import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar' })
  }
}
