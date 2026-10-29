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

function ItemMentoria({ mentoria }) {
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
      {mentoria.status === 'CONFIRMADA' && !ensina && (
        <Videochamada link={mentoria.link_videochamada} />
      )}
    </li>
  );
}

export default function Mentorias() {
  const [mentorias, setMentorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('PENDENTE');

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
                  <ItemMentoria key={m.id_mentoria} mentoria={m} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}