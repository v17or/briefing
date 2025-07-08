import '../styles/login.css'
import '../styles/paginaPrincipal.module.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
