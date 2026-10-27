import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../services/api';

export default function Autenticacao() {
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [aba, setAba] = useState('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function trocarAba(novaAba) {
    setAba(novaAba);
    setErro('');
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      if (aba === 'cadastro') {
        await api('/auth/cadastro', {
          method: 'POST',
          body: { nome, email, senha },
        });
      }
      await entrar(email, senha);
      navigate('/');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main>
      <h1>LevelUp</h1>

      <div role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'entrar'}
          onClick={() => trocarAba('entrar')}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'cadastro'}
          onClick={() => trocarAba('cadastro')}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={aoEnviar}>
        {aba === 'cadastro' && (
          <div>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        {erro && <p role="alert">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {aba === 'entrar' ? 'Acessar' : 'Cadastrar'}
        </button>
      </form>
    </main>
  );
}