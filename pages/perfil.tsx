import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/perfil.module.css';

const Perfil: React.FC = () => {
  const router = useRouter();
  const [history, setHistory] = useState<
    { type: string; news: { id: string; title: string; link: string } }[]
  >([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('user-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Seu Perfil</h1>
        <button className={styles.backButton} onClick={() => router.push('/paginaPrincipal')}>
          Voltar
        </button>
      </header>

      <section className={styles.historySection}>
        <h2 className={styles.subtitle}>Histórico de Ações</h2>
        {history.length === 0 ? (
          <p className={styles.empty}>Nenhuma ação registrada ainda.</p>
        ) : (
          <ul className={styles.historyList}>
            {history.map((item, index) => (
              <li key={index} className={styles.historyItem}>
                <strong>
                  {item.type === 'like'
                    ? '👍 Útil'
                    : item.type === 'dislike'
                    ? '👎 Não útil'
                    : '💾 Salvo'}
                </strong>
                <p>{item.news.title}</p>
                <a href={item.news.link} target="_blank" rel="noopener noreferrer">
                  Ver notícia
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Perfil;