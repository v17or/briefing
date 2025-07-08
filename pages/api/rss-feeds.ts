import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]'; // ajuste o caminho se precisar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    switch (req.method) {
      case 'GET':
        try {
          const feeds = await prisma.rSSFeed.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
          });
          return res.status(200).json(feeds);
        } catch (error) {
          console.error('Erro ao buscar feeds:', error);
          return res.status(500).json({ error: 'Erro ao buscar feeds' });
        }

      case 'POST':
        const { url, name, category } = req.body;

        if (!url || !name) {
          return res.status(400).json({ error: 'URL e nome são obrigatórios' });
        }

        try {
          const feed = await prisma.rSSFeed.create({
            data: {
              url,
              name,
              category: category || 'Geral',
              userId: user.id
            }
          });
          return res.status(201).json(feed);
        } catch (error: any) {
          console.error('Erro ao criar feed:', error);
          if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Este URL RSS já foi adicionado' });
          }
          return res.status(500).json({ error: 'Erro ao adicionar feed' });
        }

      case 'DELETE':
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID do feed é obrigatório' });
        }

        try {
          await prisma.rSSFeed.deleteMany({
            where: {
              id,
              userId: user.id
            }
          });
          return res.status(200).json({ message: 'Feed removido com sucesso' });
        } catch (error) {
          console.error('Erro ao deletar feed:', error);
          return res.status(500).json({ error: 'Erro ao remover feed' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
