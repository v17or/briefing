import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Clock, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { rssService, NewsItem } from '../lib/rssService';
import RSSManager from '../components/RSSManager';
import styles from '../styles/paginaPrincipal.module.css';

interface RSSFeed {
  id: string;
  url: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

const PaginaPrincipal: React.FC = () => {
  const router = useRouter();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [showRSSManager, setShowRSSManager] = useState(false);
  const [history, setHistory] = useState<{ type: string; news: NewsItem }[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('user-history');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveHistory = (type: 'like' | 'dislike' | 'save', news: NewsItem) => {
    const newHistory = [...history, { type, news }];
    setHistory(newHistory);
    sessionStorage.setItem('user-history', JSON.stringify(newHistory));
  };

  const loadNews = async () => {
    const activeFeeds = rssFeeds.filter(f => f.isActive);
    if (activeFeeds.length === 0) {
      setError('Nenhum feed RSS configurado. Adicione feeds RSS para ver as notícias.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const allNews: NewsItem[] = [];

      for (const feed of activeFeeds) {
        try {
          const news = await rssService.fetchAndSummarizeNews(feed.url, feed.category);
          const newsWithSource = news.map(item => ({
            ...item,
            source: feed.name
          }));
          allNews.push(...newsWithSource);
        } catch (feedError) {
          console.error(`Erro ao carregar feed ${feed.name}:`, feedError);
        }
      }

      allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setNewsData(allNews);

      if (allNews.length === 0) {
        setError('Nenhuma notícia encontrada nos feeds configurados.');
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      setError('Erro ao carregar notícias. Verifique os feeds RSS configurados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rssFeeds.length > 0) {
      loadNews();
    }
  }, [rssFeeds]);

  const getTotalFeedsCount = () => {
    return rssFeeds.filter(feed => feed.isActive).length;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Briefing</h1>
          <div className={styles.headerInfo}>
            <div className={styles.feedsInfo}>
              {getTotalFeedsCount()} feeds ativos
            </div>
            <div className={styles.newsCount}>
              {newsData.length} notícias
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.controlsHeader}>
          <button
            onClick={() => setShowRSSManager(!showRSSManager)}
            className={styles.managerToggle}
          >
            <Settings size={16} />
            {showRSSManager ? 'Ocultar' : 'Gerenciar'} Feeds RSS
          </button>
          <button
            onClick={() => router.push('/perfil')}
            className={styles.managerToggle}
          >
            👤 Perfil
          </button>
        </div>

        {showRSSManager && (
          <RSSManager onFeedsChange={setRssFeeds} />
        )}

        <div className={styles.newsHeader}>
          <h2 className={styles.newsTitle}>
            {rssFeeds.length > 0 ? 'Últimas Notícias' : 'Configure seus Feeds RSS'}
          </h2>

          {rssFeeds.length > 0 && (
            <button
              onClick={loadNews}
              className={styles.refreshButton}
              disabled={loading}
            >
              <RefreshCw className={`${styles.refreshIcon} ${loading ? styles.spinning : ''}`} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          )}
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Buscando notícias de {getTotalFeedsCount()} feeds e gerando resumos...</p>
          </div>
        )}

        {!loading && newsData.length > 0 && (
          <div className={styles.newsList}>
            {newsData.map((news) => (
              <article key={news.id} className={styles.newsCard}>
                <div className={styles.newsCardHeader}>
                  <div className={styles.newsSource}>
                    <div className={styles.sourceIndicator}></div>
                    <span className={styles.sourceName}>{news.source}</span>
                  </div>
                  <div className={styles.newsTime}>
                    <Clock className={styles.timeIcon} />
                    {news.pubDate}
                  </div>
                </div>

                <h3 className={styles.newsContentTitle}>{news.title}</h3>

                <div className={styles.summaryContainer}>
                  <h4 className={styles.summaryTitle}>Resumo:</h4>
                  <p className={styles.newsSummary}>{news.summary}</p>
                </div>

                <div className={styles.newsFooter}>
                  <span className={`${styles.badge} ${styles[news.category?.toLowerCase()]}`}>
                    {news.category}
                  </span>
                </div>

                <div className={styles.newsActionsRow}>
                  <button
                    className={`${styles.iconButton} ${history.some(h => h.news.id === news.id && h.type === 'like') ? styles.ativo : ''}`}
                    onClick={() => saveHistory('like', news)}
                  >
                    👍 Útil
                  </button>
                  <button
                    className={`${styles.iconButton} ${history.some(h => h.news.id === news.id && h.type === 'dislike') ? styles.ativo : ''}`}
                    onClick={() => saveHistory('dislike', news)}
                  >
                    👎 Não útil
                  </button>
                  <button
                    className={`${styles.iconButton} ${history.some(h => h.news.id === news.id && h.type === 'save') ? styles.ativo : ''}`}
                    onClick={() => saveHistory('save', news)}
                  >
                    💾 Salvar
                  </button>
                </div>

                <div className={styles.newsActions}>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.readMoreButton}
                  >
                    Ler matéria completa <ExternalLink className={styles.externalIcon} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && newsData.length === 0 && rssFeeds.length === 0 && (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyStateTitle}>Bem-vindo ao Briefing!</h3>
            <p>Para começar, adicione seus feeds RSS preferidos clicando em "Gerenciar Feeds RSS".</p>
            <p>Você pode adicionar feeds de sites como G1, Folha, UOL, e muitos outros.</p>
            <br /><br />
            <button
              onClick={() => setShowRSSManager(true)}
              className={styles.primaryButton}
            >
              <Settings size={16} />
              Configurar Feeds RSS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaPrincipal;