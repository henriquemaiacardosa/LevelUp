import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../services/api';
import './Autenticacao.css';

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
    <main className="auth">
      <header className="auth__intro">
        <p className="marca">
          <span className="marca__simbolo" aria-hidden="true" />
          LevelUp
        </p>
        <h1 className="auth__titulo">
          Ensine o que sabe.
          <br />
          Aprenda o que precisa.
        </h1>
        <p className="auth__texto">
          Mentorias entre colegas da faculdade, sem custo. Cada encontro concluído
          rende XP e leva você mais alto no ranking.
        </p>
      </header>

      <section className="auth__regras">
        <ul className="regras-xp" aria-label="Como o XP funciona">
          <li className="regra regra--ensino">
            <span className="regra__rotulo">Quem ensina</span>
            <span className="regra__valor">+50 XP</span>
            <span className="regra__barra" aria-hidden="true">
              <span className="regra__preenchimento" style={{ '--parte': '50%' }} />
            </span>
          </li>
          <li className="regra regra--aprendizado">
            <span className="regra__rotulo">Quem aprende</span>
            <span className="regra__valor">+20 XP</span>
            <span className="regra__barra" aria-hidden="true">
              <span className="regra__preenchimento" style={{ '--parte': '20%' }} />
            </span>
          </li>
        </ul>
        <p className="regras-xp__nota">Cada nível tem 100 XP.</p>
      </section>

      <section className="painel auth__painel">
        <div className="painel__conteudo">
          <div className="abas" role="tablist">
            <button
              type="button"
              role="tab"
              className="aba"
              aria-selected={aba === 'entrar'}
              onClick={() => trocarAba('entrar')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              className="aba"
              aria-selected={aba === 'cadastro'}
              onClick={() => trocarAba('cadastro')}
            >
              Criar conta
            </button>
          </div>

          <form className="formulario" onSubmit={aoEnviar}>
            {aba === 'cadastro' && (
              <div className="campo">
                <label className="campo__rotulo" htmlFor="nome">
                  Nome
                </label>
                <input
                  id="nome"
                  className="campo__entrada"
                  type="text"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="campo">
              <label className="campo__rotulo" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                className="campo__entrada"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label className="campo__rotulo" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                className="campo__entrada"
                type="password"
                autoComplete={aba === 'entrar' ? 'current-password' : 'new-password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            {erro && (
              <p role="alert" className="aviso">
                {erro}
              </p>
            )}

            <button type="submit" className="botao botao--primario" disabled={enviando}>
              {aba === 'entrar' ? 'Acessar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}