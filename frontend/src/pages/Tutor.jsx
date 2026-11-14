import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './Tutor.css';

const DIAS = {
  SEGUNDA: 'Segunda',
  TERCA: 'Terça',
  QUARTA: 'Quarta',
  QUINTA: 'Quinta',
  SEXTA: 'Sexta',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

const TURNOS = { MANHA: 'manhã', TARDE: 'tarde', NOITE: 'noite' };

// A API já devolve os horários ordenados por dia e turno; o Map preserva essa ordem.
function agruparHorarios(disponibilidade) {
  const porDia = new Map();
  for (const { dia_semana, turno } of disponibilidade) {
    if (!porDia.has(dia_semana)) porDia.set(dia_semana, []);
    porDia.get(dia_semana).push(TURNOS[turno]);
  }
  return [...porDia].map(([dia, turnos]) => ({
    dia,
    texto: `${DIAS[dia]}: ${turnos.join(', ')}`,
  }));
}

export default function Tutor() {
  const { id } = useParams();
  const [tutor, setTutor] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    api(`/tutores/${id}`)
      .then((dados) => {
        if (ativo) setTutor(dados);
      })
      .catch((e) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  const horarios = tutor ? agruparHorarios(tutor.disponibilidade) : [];

  return (
    <section className="tutor-detalhes">
      <Link to="/buscar" className="tutor-detalhes__voltar">
        Voltar à busca
      </Link>

      {carregando && <p className="tutor-detalhes__texto">Carregando…</p>}

      {erro && (
        <p className="aviso" role="alert">
          {erro}
        </p>
      )}

      {tutor && (
        <>
          <div className="painel">
            <div className="painel__conteudo tutor-detalhes__resumo">
              <div className="tutor-detalhes__cabecalho">
                <span className="tutor-detalhes__inicial" aria-hidden="true">
                  {tutor.nome.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h1 className="tutor-detalhes__nome">{tutor.nome}</h1>
                  <p className="tutor-detalhes__texto">{tutor.curso ?? 'Curso não informado'}</p>
                  {tutor.semestre != null && (
                    <p className="tutor-detalhes__texto">{tutor.semestre}º semestre</p>
                  )}
                </div>
              </div>

              <div className="tutor-detalhes__pontos">
                <p className="tutor-detalhes__nivel">Nível {tutor.nivel}</p>
                <p className="tutor-detalhes__texto">{tutor.xp_ensino} XP de ensino</p>
                <p className="tutor-detalhes__texto">{tutor.xp_total} XP no total</p>
              </div>
            </div>
          </div>

          <section className="tutor-detalhes__secao">
            <h2 className="tutor-detalhes__titulo">Disciplinas que ensina</h2>
            <ul className="tutor-detalhes__lista" aria-label="Disciplinas que ensina">
              {tutor.disciplinas.map((d) => (
                <li key={d.id_disciplina} className="tutor-detalhes__disciplina">
                  {d.nome_disciplina}
                </li>
              ))}
            </ul>
          </section>

          <section className="tutor-detalhes__secao">
            <h2 className="tutor-detalhes__titulo">Horários disponíveis</h2>
            {horarios.length === 0 ? (
              <p className="tutor-detalhes__texto">Este tutor ainda não informou horários.</p>
            ) : (
              <ul className="tutor-detalhes__horarios" aria-label="Horários disponíveis">
                {horarios.map((h) => (
                  <li key={h.dia} className="tutor-detalhes__horario">
                    {h.texto}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  );
}