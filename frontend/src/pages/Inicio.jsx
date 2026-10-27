import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Inicio.css';

const XP_POR_NIVEL = 100;
const MAXIMO_NA_AGENDA = 3;

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function Inicio() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    Promise.all([api('/users/perfil'), api('/users/xp'), api('/mentorias')])
      .then(([perfil, xp, mentorias]) => {
        if (ativo) setDados({ perfil, xp, mentorias });
      })
      .catch((e) => {
        if (ativo) setErro(e.message);
      });

    return () => {
      ativo = false;
    };
  }, []);

  if (erro) {
    return (
      <p role="alert" className="aviso">
        {erro}
      </p>
    );
  }

  if (!dados) {
    return <p className="inicio__carregando">Carregando…</p>;
  }

  const { perfil, xp, mentorias } = dados;
  const primeiroNome = perfil.nome.split(' ')[0];
  const xpNoNivel = xp.xp_total % XP_POR_NIVEL;
  const agenda = mentorias
    .filter((m) => m.status === 'PENDENTE' || m.status === 'CONFIRMADA')
    .slice(0, MAXIMO_NA_AGENDA);

  return (
    <div className="inicio">
      <h1 className="inicio__titulo">Olá, {primeiroNome}</h1>

      <div className="inicio__topo">
        <section className="painel">
          <div className="painel__conteudo nivel">
            <p className="nivel__numero">Nível {xp.nivel}</p>

            <div
              className="nivel__barra"
              role="progressbar"
              aria-label="Progresso do nível"
              aria-valuemin={0}
              aria-valuemax={XP_POR_NIVEL}
              aria-valuenow={xpNoNivel}
            >
              <span className="nivel__preenchimento" style={{ '--parte': `${xpNoNivel}%` }} />
            </div>
            <p className="nivel__texto">
              {xpNoNivel} de {XP_POR_NIVEL} XP para o nível {xp.nivel + 1}
            </p>

            <dl className="totais">
              <div className="totais__item totais__item--ensino">
                <dd className="totais__valor">{xp.xp_ensino}</dd>
                <dt className="totais__rotulo">XP de ensino</dt>
              </div>
              <div className="totais__item totais__item--aprendizado">
                <dd className="totais__valor">{xp.xp_aprendizado}</dd>
                <dt className="totais__rotulo">XP de aprendizado</dt>
              </div>
            </dl>
          </div>
        </section>

        <section className="atalhos" aria-label="Atalhos">
          <Link to="/buscar" className="botao botao--ciano">
            Quero aprender
          </Link>
          <Link to="/perfil" className="botao botao--primario">
            Quero ensinar
          </Link>
        </section>
      </div>

      <section className="agenda">
        <h2 className="agenda__titulo">Próximas mentorias</h2>

        {agenda.length === 0 ? (
          <div className="agenda__vazia">
            <p>Você ainda não tem mentorias agendadas.</p>
            <Link to="/buscar" className="agenda__link">
              Buscar tutores
            </Link>
          </div>
        ) : (
          <ul className="agenda__lista">
            {agenda.map((m) => (
              <li
                key={m.id_mentoria}
                className={`agenda__item agenda__item--${m.papel === 'TUTOR' ? 'ensino' : 'aprendizado'}`}
              >
                <div>
                  <p className="agenda__disciplina">{m.disciplina}</p>
                  <p className="agenda__detalhe">
                    {m.papel === 'TUTOR' ? 'Você ensina' : 'Você aprende com'} {m.outra_pessoa.nome}
                  </p>
                </div>
                <div className="agenda__lado">
                  <time dateTime={m.data_hora}>{formatarData(m.data_hora)}</time>
                  <span className={`selo selo--${m.status === 'CONFIRMADA' ? 'confirmada' : 'pendente'}`}>
                    {m.status === 'CONFIRMADA' ? 'Confirmada' : 'Pendente'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}