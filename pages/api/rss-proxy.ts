import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL é obrigatória' });
  }

  try {
    const response = await fetch(url as string);
    const xmlData = await response.text();
    
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xmlData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar RSS' });
  }
}