import { useState } from 'react'
import { authAPI } from '../services/api'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'
import './Login.css'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await authAPI.login(email, senha)
      
      if (response.data?.token) {
        // Token já foi salvo pelo authAPI.login
        onLoginSuccess?.(response.data)
      } else {
        setError('Resposta inválida do servidor')
      }
    } catch (error) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card title="Login" className="login-card">
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            fullWidth
            disabled={isLoading}
          />

          <Input
            type="password"
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            required
            fullWidth
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="login-info">
          <p className="info-text">
            Sistema de Portaria Digital
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Login
