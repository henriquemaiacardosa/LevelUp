import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Busca.css';

export default function Busca() {
  const [disciplinas, setDisciplinas] = useState([]);
  const [idDisciplina, setIdDisciplina] = useState('');
  const [tutores, setTutores] = useState(null);
  const [disciplinaBuscada, setDisciplinaBuscada] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const [solicitando, setSolicitando] = useState(null);
  const [dataHora, setDataHora] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroSolicitacao, setErroSolicitacao] = useState('');
  const [enviadoPara, setEnviadoPara] = useState('');

  useEffect(() => {
    let ativo = true;

    api('/disciplinas')
      .then((lista) => {
        if (ativo) setDisciplinas(lista);
      })
      .catch((e) => {
        if (ativo) setErro(e.message);
      });

    return () => {
      ativo = false;
    };
  }, []);

  async function buscar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviadoPara('');
    setSolicitando(null);
    setBuscando(true);

    try {
      const lista = await api(`/matchmaking?id_disciplina=${idDisciplina}`);
      setTutores(lista);
      setDisciplinaBuscada(Number(idDisciplina));
    } catch (e) {
      setTutores(null);
      setErro(e.message);
    } finally {
      setBuscando(false);
    }
  }

  function abrirFormulario(id_usuario) {
    setSolicitando(id_usuario);
    setDataHora('');
    setErroSolicitacao('');
    setEnviadoPara('');
  }

  async function solicitar(evento, tutor) {
    evento.preventDefault();
    setErroSolicitacao('');
    setEnviando(true);

    try {
      await api('/mentorias', {
        method: 'POST',
        body: {
          id_tutor: tutor.id_usuario,
          id_disciplina: disciplinaBuscada,
          data_hora: new Date(dataHora).toISOString(),
        },
      });
      setEnviadoPara(tutor.nome);
      setSolicitando(null);
    } catch (e) {
      setErroSolicitacao(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="busca">
      <header>
        <h1 className="busca__titulo">Buscar tutores</h1>
        <p className="busca__texto">Escolha a disciplina em que você precisa de ajuda.</p>
      </header>

      <form className="busca__filtro" onSubmit={buscar}>
        <div className="campo">
          <label className="campo__rotulo" htmlFor="disciplina">
            Disciplina
          </label>
          <select
            id="disciplina"
            className="campo__entrada"
            value={idDisciplina}
            onChange={(e) => setIdDisciplina(e.target.value)}
          >
            <option value="">Selecione…</option>
            {disciplinas.map((d) => (
              <option key={d.id_disciplina} value={d.id_disciplina}>
                {d.nome_disciplina}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="botao botao--ciano" disabled={!idDisciplina || buscando}>
          Buscar
        </button>
      </form>

      {erro && (
        <p role="alert" className="aviso">
          {erro}
        </p>
      )}

      {enviadoPara && (
        <div role="status" className="aviso aviso--ok">
          <p>Solicitação enviada para {enviadoPara}.</p>
          <Link to="/mentorias" className="busca__link">
            Ver minhas mentorias
          </Link>
        </div>
      )}

      {tutores && tutores.length === 0 && (
        <p className="busca__vazio">Nenhum tutor encontrado para esta disciplina.</p>
      )}

      {tutores && tutores.length > 0 && (
        <ul className="tutores">
          {tutores.map((tutor) => (
            <li key={tutor.id_usuario} className="tutor">
              <div className="tutor__cabecalho">
                <span className="tutor__inicial" aria-hidden="true">
                  {tutor.nome.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h3 className="tutor__nome">{tutor.nome}</h3>
                  <p className="tutor__detalhe">{tutor.curso ?? 'Curso não informado'}</p>
                  {tutor.semestre != null && (
                    <p className="tutor__detalhe">{tutor.semestre}º semestre</p>
                  )}
                </div>
              </div>

              {solicitando === tutor.id_usuario ? (
                <form className="solicitacao" onSubmit={(e) => solicitar(e, tutor)}>
                  <div className="campo">
                    <label className="campo__rotulo" htmlFor={`data-${tutor.id_usuario}`}>
                      Data e hora
                    </label>
                    <input
                      id={`data-${tutor.id_usuario}`}
                      className="campo__entrada"
                      type="datetime-local"
                      value={dataHora}
                      onChange={(e) => setDataHora(e.target.value)}
                      required
                    />
                  </div>

                  {erroSolicitacao && (
                    <p role="alert" className="aviso">
                      {erroSolicitacao}
                    </p>
                  )}

                  <div className="solicitacao__acoes">
                    <button type="submit" className="botao botao--primario" disabled={enviando}>
                      Enviar solicitação
                    </button>
                    <button
                      type="button"
                      className="busca__cancelar"
                      onClick={() => setSolicitando(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="botao botao--primario"
                  onClick={() => abrirFormulario(tutor.id_usuario)}
                >
                  Solicitar mentoria
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}