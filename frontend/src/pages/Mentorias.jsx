import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './Mentorias.css';

const ABAS = [
  { status: 'PENDENTE', rotulo: 'Pendentes' },
  { status: 'CONFIRMADA', rotulo: 'Confirmadas' },
  { status: 'CONCLUIDA', rotulo: 'Concluídas' },
  { status: 'CANCELADA', rotulo: 'Canceladas' },
];

function linkSeguro(valor) {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function formatarData(valor) {
  return new Date(valor).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function Videochamada({ link }) {
  const href = linkSeguro(link);

  if (!href) {
    return <p className="mentoria__detalhe">O tutor ainda não enviou o link.</p>;
  }

  return (
    <a className="botao botao--ciano" href={href} target="_blank" rel="noopener noreferrer">
      Entrar na videochamada
    </a>
  );
}

function Acoes({ mentoria, ocupado, onAcao }) {
  const [linkDigitado, setLinkDigitado] = useState(mentoria.link_videochamada ?? '');
  const ensina = mentoria.papel === 'TUTOR';
  const base = `/mentorias/${mentoria.id_mentoria}`;

  const cancelar = (
    <button
      type="button"
      className="botao-acao botao-acao--perigo"
      disabled={ocupado}
      onClick={() => onAcao(`${base}/cancelar`, { method: 'PATCH' }, 'Mentoria cancelada.')}
    >
      Cancelar mentoria
    </button>
  );

  if (mentoria.status === 'PENDENTE') {
    if (!ensina) {
      return <p className="mentoria__detalhe">Aguardando resposta do tutor.</p>;
    }

    return (
      <div className="mentoria__acoes">
        <button
          type="button"
          className="botao botao--primario"
          disabled={ocupado}
          onClick={() =>
            onAcao(`${base}/status`, { method: 'PATCH', body: { status: 'CONFIRMADA' } }, 'Mentoria aceita.')
          }
        >
          Aceitar
        </button>
        <button
          type="button"
          className="botao-acao botao-acao--perigo"
          disabled={ocupado}
          onClick={() =>
            onAcao(`${base}/status`, { method: 'PATCH', body: { status: 'CANCELADA' } }, 'Mentoria recusada.')
          }
        >
          Recusar
        </button>
      </div>
    );
  }

  if (mentoria.status === 'CONFIRMADA') {
    if (!ensina) {
      return (
        <div className="mentoria__acoes">
          <Videochamada link={mentoria.link_videochamada} />
          {cancelar}
        </div>
      );
    }

    return (
      <div className="mentoria__acoes mentoria__acoes--tutor">
        <div className="campo">
          <label className="campo__rotulo" htmlFor={`link-${mentoria.id_mentoria}`}>
            Link da videochamada
          </label>
          <input
            id={`link-${mentoria.id_mentoria}`}
            className="campo__entrada"
            type="url"
            value={linkDigitado}
            onChange={(e) => setLinkDigitado(e.target.value)}
            placeholder="https://meet.google.com/…"
          />
        </div>
        <div className="mentoria__botoes">
          <button
            type="button"
            className="botao botao--ciano"
            disabled={ocupado || linkDigitado.trim() === ''}
            onClick={() =>
              onAcao(
                `${base}/link`,
                { method: 'PATCH', body: { link_videochamada: linkDigitado.trim() } },
                'Link salvo.',
              )
            }
          >
            Salvar link
          </button>
          <button
            type="button"
            className="botao botao--primario"
            disabled={ocupado}
            onClick={() => onAcao(`${base}/concluir`, { method: 'PATCH' }, 'Mentoria concluída.')}
          >
            Concluir mentoria
          </button>
          {cancelar}
        </div>
      </div>
    );
  }

  return null;
}

function ItemMentoria({ mentoria, ocupado, onAcao }) {
  const ensina = mentoria.papel === 'TUTOR';
  const frase = ensina
    ? `Você ensina ${mentoria.outra_pessoa.nome}`
    : `Você aprende com ${mentoria.outra_pessoa.nome}`;

  return (
    <li className={`mentoria ${ensina ? 'mentoria--ensina' : 'mentoria--aprende'}`}>
      <div>
        <h3 className="mentoria__disciplina">{mentoria.disciplina}</h3>
        <p className="mentoria__detalhe">{frase}</p>
        <p className="mentoria__detalhe">
          <time dateTime={new Date(mentoria.data_hora).toISOString()}>
            {formatarData(mentoria.data_hora)}
          </time>
        </p>
      </div>
      <Acoes mentoria={mentoria} ocupado={ocupado} onAcao={onAcao} />
    </li>
  );
}

export default function Mentorias() {
  const [mentorias, setMentorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('PENDENTE');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const lista = await api('/mentorias');
        if (ativo) setMentorias(lista);
      } catch (e) {
        if (ativo) setErro(e.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  async function executarAcao(caminho, opcoes, sucesso) {
    setOcupado(true);
    setMensagem('');
    setErroAcao('');

    try {
      await api(caminho, opcoes);
      setMensagem(sucesso);
      setMentorias(await api('/mentorias'));
    } catch (e) {
      setErroAcao(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const contagem = (status) => mentorias.filter((m) => m.status === status).length;
  const visiveis = mentorias.filter((m) => m.status === abaAtiva);

  return (
    <section className="mentorias">
      <header>
        <h1 className="mentorias__titulo">Minhas mentorias</h1>
        <p className="mentorias__texto">Acompanhe o que você ensina e o que você aprende.</p>
      </header>

      {carregando && <p className="mentorias__texto">Carregando…</p>}

      {erro && (
        <p className="aviso" role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="mentorias__ok" role="status">
          {mensagem}
        </p>
      )}

      {erroAcao && (
        <p className="aviso" role="alert">
          {erroAcao}
        </p>
      )}

      {!carregando && !erro && (
        <>
          <div className="abas" role="tablist" aria-label="Status das mentorias">
            {ABAS.map((aba) => (
              <button
                key={aba.status}
                type="button"
                role="tab"
                id={`aba-${aba.status}`}
                aria-selected={abaAtiva === aba.status}
                aria-controls="painel-mentorias"
                className="aba"
                onClick={() => setAbaAtiva(aba.status)}
              >
                {`${aba.rotulo} (${contagem(aba.status)})`}
              </button>
            ))}
          </div>

          <div id="painel-mentorias" role="tabpanel" aria-labelledby={`aba-${abaAtiva}`}>
            {visiveis.length === 0 ? (
              <p className="mentorias__vazio">Nenhuma mentoria nesta aba.</p>
            ) : (
              <ul className="mentorias__lista">
                {visiveis.map((m) => (
                  <ItemMentoria
                    key={m.id_mentoria}
                    mentoria={m}
                    ocupado={ocupado}
                    onAcao={executarAcao}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}