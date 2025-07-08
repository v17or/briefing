import { XMLParser } from 'fast-xml-parser';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

class RSSService {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: true,
    });
  }

  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').trim();
  }

  async fetchAndSummarizeNews(rssUrl: string, category: string): Promise<NewsItem[]> {
    try {
      const response = await fetch(`/api/rss-proxy?url=${encodeURIComponent(rssUrl)}`);
      const xmlText = await response.text();
      const parsed = this.parser.parse(xmlText);
      const items = parsed.rss?.channel?.item || [];
      const itemsArray = Array.isArray(items) ? items : [items];
      const top3Items = itemsArray.slice(0, 3);

      const newsWithSummaries = await Promise.all(
        top3Items.map(async (item: any) => {
          const cleanDescription = this.stripHTML(item.description || '');
          const summary = await this.generateSummary(item.title, cleanDescription);

          return {
            id: item.guid?.['#text'] || item.link || Math.random().toString(),
            title: item.title || '',
            description: cleanDescription,
            summary,
            link: item.link || '',
            pubDate: this.formatDate(item.pubDate),
            source: 'G1',
            category
          };
        })
      );

      return newsWithSummaries;
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      return [];
    }
  }

  private async generateSummary(title: string, description: string): Promise<string> {
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();
      return data.summary || 'Resumo não disponível';
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      return description.length > 150 ? description.substring(0, 150) + '...' : description;
    }
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
      return `${Math.floor(diffInMinutes / 1440)}d atrás`;
    } catch {
      return 'Agora';
    }
  }
}

export const rssService = new RSSService();