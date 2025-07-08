// pages/api/noticias.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Tipo do item RSS
type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const parser = new Parser<{}, FeedItem>();
  const feed = await parser.parseURL('https://g1.globo.com/rss/g1/esportes/');

  const noticias = await Promise.all(
    feed.items.slice(0, 5).map(async (item, index) => {
      let description = '';

      try {
        const { data } = await axios.get(item.link);
        const $ = cheerio.load(data);
        const paragrafos = $('div.mc-body p');
        description = paragrafos
          .map((_, el) => $(el).text())
          .get()
          .slice(0, 3)
          .join(' ');
      } catch {
        description = item.contentSnippet || 'Descrição indisponível';
      }

      return {
        id: index + 1,
        title: item.title,
        description,
        category: 'Esportes',
        source: 'G1',
        time: new Date(item.pubDate).toLocaleString('pt-BR'),
        likes: Math.floor(Math.random() * 200),
        dislikes: Math.floor(Math.random() * 50),
      };
    })
  );

  res.status(200).json(noticias);
};

export default handler;
