import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um jornalista que cria resumos de notícias em português. Faça um resumo em até 2 frases, destacando os pontos mais importantes."
        },
        {
          role: "user",
          content: `Título: ${title}\n\nDescrição: ${description}\n\nResumo:`
        }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content || 'Resumo não disponível';

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    // Fallback: usar descrição original
    const fallback = description.length > 150 ? description.substring(0, 150) + '...' : description;
    res.status(200).json({ summary: fallback });
  }
}