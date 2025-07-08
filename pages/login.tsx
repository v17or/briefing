import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    })

    if (res?.ok) router.push('/paginaPrincipal')
    else alert('Erro no login')
  }

  return (
    <div className="login-background">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-label">Usuário: </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="Digite seu e-mail"
              required
            />
          </div>
          <div>
            <label className="login-label">Senha: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input" 
              placeholder="Digite sua senha"
              required
            />
          </div>
          <div className="login-remember">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-sm">Lembrar-se </label>
          </div>
          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
        <div className="login-footer">
          Novo(a) aqui? <a href="/register" className="login-link">Criar conta</a>
        </div>
      </div>
    </div>
  )
}
