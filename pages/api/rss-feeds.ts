import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Você esqueceu de fazer login. Faça isso pra continuar.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Não achei esse usuário aqui. Tem certeza que está logado?' });
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
          return res.status(500).json({ error: 'Ih, não consegui carregar seus feeds agora. Tenta de novo mais tarde.' });
        }

      case 'POST':
        const { url, name, category } = req.body;

        if (!url || !name) {
          return res.status(400).json({ error: 'Preenche aí a URL e o nome do feed, por favor.' });
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
            return res.status(409).json({ error: 'Esse feed já foi adicionado, viu?' });
          }
          return res.status(500).json({ error: 'Deu ruim ao salvar o feed. Tenta mais tarde.' });
        }

      case 'DELETE':
        const { id } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'Preciso do ID do feed pra poder apagar.' });
        }

        try {
          await prisma.rSSFeed.deleteMany({
            where: {
              id,
              userId: user.id
            }
          });
          return res.status(200).json({ message: 'Feed apagado com sucesso. Valeu!' });
        } catch (error) {
          console.error('Erro ao deletar feed:', error);
          return res.status(500).json({ error: 'Não consegui apagar o feed agora. Tenta mais tarde.' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`O método ${req.method} não é aceito aqui. Bora usar o certo!`);
    }
  } catch (error) {
    console.error('Erro geral na API:', error);
    return res.status(500).json({ error: 'Algo deu ruim por aqui. Espera um pouco e tenta de novo.' });
  }
}