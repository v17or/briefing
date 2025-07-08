import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Trash2 } from 'lucide-react';

interface RSSFeed {
  id: string;
  url: string;
  name: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface RSSManagerProps {
  onFeedsChange: (feeds: RSSFeed[]) => void;
}

const RSSManager: React.FC<RSSManagerProps> = ({ onFeedsChange }) => {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeed, setNewFeed] = useState({ url: '', name: '', category: 'Geral' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar feeds ao montar o componente
  useEffect(() => {
    loadFeeds();
  }, []);

  // Notificar mudanças nos feeds
  useEffect(() => {
    onFeedsChange(feeds);
  }, [feeds, onFeedsChange]);

  const loadFeeds = async () => {
    try {
      const response = await fetch('/api/rss-feeds');
      if (response.ok) {
        const data = await response.json();
        setFeeds(data);
      } else {
        console.error('Erro ao carregar feeds:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar feeds:', error);
    }
  };

  const addFeed = async () => {
    if (!newFeed.url || !newFeed.name) {
      setError('URL e nome são obrigatórios');
      return;
    }

    if (!validateURL(newFeed.url)) {
      setError('URL inválida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rss-feeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFeed),
      });

      if (response.ok) {
        const feed = await response.json();
        setFeeds([...feeds, feed]);
        setNewFeed({ url: '', name: '', category: 'Geral' });
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao adicionar feed');
      }
    } catch (error) {
      setError('Erro ao adicionar feed');
    } finally {
      setLoading(false);
    }
  };

  const removeFeed = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este feed?')) return;

    try {
      const response = await fetch('/api/rss-feeds', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setFeeds(feeds.filter(feed => feed.id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao remover feed');
      }
    } catch (error) {
      setError('Erro ao remover feed');
    }
  };

  const validateURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const rssManagerStyles = {
    container: {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px',
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    title: {
      margin: 0,
      fontSize: '18px',
      fontWeight: 600,
      color: '#1f2937',
    },
    feedCount: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: 400,
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    addForm: {
      background: '#f9fafb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontWeight: 500,
      color: '#374151',
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white',
      boxSizing: 'border-box' as const,
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
    },
    saveButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      background: '#10b981',
      color: 'white',
      border: 'none',
    },
    cancelButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      background: 'transparent',
      color: '#6b7280',
      border: '1px solid #d1d5db',
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '10px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      marginBottom: '16px',
    },
    feedsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    feedItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      background: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    },
    feedInfo: {
      flex: 1,
    },
    feedName: {
      fontWeight: 600,
      color: '#1f2937',
      marginBottom: '4px',
    },
    feedUrl: {
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '8px',
      wordBreak: 'break-all' as const,
    },
    feedMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
    },
    feedCategory: {
      background: '#dbeafe',
      color: '#1e40af',
      padding: '2px 8px',
      borderRadius: '12px',
      fontWeight: 500,
    },
    feedDate: {
      color: '#9ca3af',
    },
    removeButton: {
      background: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      borderRadius: '6px',
      padding: '8px',
      cursor: 'pointer',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '40px 20px',
      color: '#6b7280',
    },
  };

  return (
    <div style={rssManagerStyles.container}>
      {/* Header */}
      <div style={rssManagerStyles.header}>
        <div style={rssManagerStyles.headerTitle}>
          <Settings style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          <h3 style={rssManagerStyles.title}>Gerenciar Feeds RSS</h3>
          <span style={rssManagerStyles.feedCount}>({feeds.length})</span>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={rssManagerStyles.addButton}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#3b82f6')}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Adicionar Feed
        </button>
      </div>

      {/* Formulário de adicionar feed */}
      {showAddForm && (
        <div style={rssManagerStyles.addForm}>
          <div style={rssManagerStyles.formGroup}>
            <label style={rssManagerStyles.label}>URL do RSS:</label>
            <input
              type="url"
              value={newFeed.url}
              onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
              placeholder="https://exemplo.com/rss"
              style={rssManagerStyles.input}
            />
          </div>

          <div style={rssManagerStyles.formGroup}>
            <label style={rssManagerStyles.label}>Nome do Feed:</label>
            <input
              type="text"
              value={newFeed.name}
              onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
              placeholder="Ex: Portal de Notícias"
              style={rssManagerStyles.input}
            />
          </div>

          <div style={rssManagerStyles.formGroup}>
            <label style={rssManagerStyles.label}>Categoria:</label>
            <select
              value={newFeed.category}
              onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
              style={rssManagerStyles.input}
            >
              <option value="Geral">Geral</option>
              <option value="Economia">Economia</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Esportes">Esportes</option>
              <option value="Política">Política</option>
              <option value="Saúde">Saúde</option>
            </select>
          </div>

          {error && (
            <div style={rssManagerStyles.errorMessage}>
              {error}
            </div>
          )}

          <div style={rssManagerStyles.formActions}>
            <button
              onClick={addFeed}
              disabled={loading || !validateURL(newFeed.url)}
              style={{
                ...rssManagerStyles.saveButton,
                ...(loading || !validateURL(newFeed.url) ? { background: '#9ca3af', cursor: 'not-allowed' } : {})
              }}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            
            <button
              onClick={() => {
                setShowAddForm(false);
                setError('');
                setNewFeed({ url: '', name: '', category: 'Geral' });
              }}
              style={rssManagerStyles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de feeds */}
      <div style={rssManagerStyles.feedsList}>
        {feeds.map((feed) => (
          <div key={feed.id} style={rssManagerStyles.feedItem}>
            <div style={rssManagerStyles.feedInfo}>
              <div style={rssManagerStyles.feedName}>{feed.name}</div>
              <div style={rssManagerStyles.feedUrl}>{feed.url}</div>
              <div style={rssManagerStyles.feedMeta}>
                <span style={rssManagerStyles.feedCategory}>{feed.category}</span>
                <span style={rssManagerStyles.feedDate}>
                  Adicionado em {new Date(feed.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => removeFeed(feed.id)}
              style={rssManagerStyles.removeButton}
              title="Remover feed"
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        ))}
        
        {feeds.length === 0 && (
          <div style={rssManagerStyles.emptyState}>
            <p>Nenhum feed RSS adicionado ainda.</p>
            <p>Clique em "Adicionar Feed" para começar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RSSManager;