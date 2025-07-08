import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      router.push('/login')
    } else {
      alert('Erro ao registrar')
    }
  }

  return (
    <div className="login-background">
      <div className="login-card">
        <h2 className="login-title">Cadastrar</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-label">Nome: </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="login-input"
              required
            />
          </div>
          <div>
            <label className="login-label">Email:  </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="login-input"
              required
            />
          </div>
          <div>
            <label className="login-label">Senha: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}
