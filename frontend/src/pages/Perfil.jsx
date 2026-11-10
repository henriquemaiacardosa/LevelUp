import { Fragment, useEffect, useState } from 'react';
import { api } from '../services/api';
import './Perfil.css';

function BlocoHabilidade({
  titulo,
  variante,
  rotuloLista,
  rotuloSeletor,
  rotuloBotao,
  itens,
  disciplinas,
  ocupado,
  onAdicionar,
}) {
  const [escolhida, setEscolhida] = useState('');
  const disponiveis = disciplinas.filter(
    (d) => !itens.some((i) => i.id_disciplina === d.id_disciplina),
  );

  async function enviar(evento) {
    evento.preventDefault();
    const deuCerto = await onAdicionar(Number(escolhida));
    if (deuCerto) setEscolhida('');
  }

  return (
    <section className={`habilidades habilidades--${variante}`}>
      <h2 className="habilidades__titulo">{titulo}</h2>

      <ul className="habilidades__lista" aria-label={rotuloLista}>
        {itens.length === 0 ? (
          <li className="habilidades__vazio">Nenhuma disciplina cadastrada.</li>
        ) : (
          itens.map((item) => (
            <li key={item.id_habilidade} className="habilidades__item">
              {item.nome_disciplina}
            </li>
          ))
        )}
      </ul>

      <form className="habilidades__form" onSubmit={enviar}>
        <div className="campo">
          <label className="campo__rotulo" htmlFor={`seletor-${variante}`}>
            {rotuloSeletor}
          </label>
          <select
            id={`seletor-${variante}`}
            className="campo__entrada"
            value={escolhida}
            onChange={(e) => setEscolhida(e.target.value)}
          >
            <option value="">Escolha uma disciplina</option>
            {disponiveis.map((d) => (
              <option key={d.id_disciplina} value={d.id_disciplina}>
                {d.nome_disciplina}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={`botao ${variante === 'ensina' ? 'botao--primario' : 'botao--ciano'}`}
          disabled={ocupado || escolhida === ''}
        >
          {rotuloBotao}
        </button>
      </form>
    </section>
  );
}

const DIAS = [
  { valor: 'SEGUNDA', rotulo: 'Segunda' },
  { valor: 'TERCA', rotulo: 'Terça' },
  { valor: 'QUARTA', rotulo: 'Quarta' },
  { valor: 'QUINTA', rotulo: 'Quinta' },
  { valor: 'SEXTA', rotulo: 'Sexta' },
  { valor: 'SABADO', rotulo: 'Sábado' },
  { valor: 'DOMINGO', rotulo: 'Domingo' },
];

const TURNOS = [
  { valor: 'MANHA', rotulo: 'manhã' },
  { valor: 'TARDE', rotulo: 'tarde' },
  { valor: 'NOITE', rotulo: 'noite' },
];

function QuadroDisponibilidade({ marcados, ocupado, onAlternar, onSalvar }) {
  return (
    <form className="painel disponibilidade" onSubmit={onSalvar}>
      <div className="painel__conteudo">
        <fieldset className="disponibilidade__quadro">
          <legend className="disponibilidade__titulo">Disponibilidade para ensinar</legend>
          <p className="perfil__texto">
            Marque os dias e turnos em que você pode receber pedidos de mentoria.
          </p>

          <div className="disponibilidade__grade">
            <span aria-hidden="true" />
            {TURNOS.map((turno) => (
              <span key={turno.valor} className="disponibilidade__cabecalho" aria-hidden="true">
                {turno.rotulo}
              </span>
            ))}

            {DIAS.map((dia) => (
              <Fragment key={dia.valor}>
                <span className="disponibilidade__dia" aria-hidden="true">
                  {dia.rotulo}
                </span>
                {TURNOS.map((turno) => {
                  const chave = `${dia.valor}:${turno.valor}`;
                  const marcado = marcados.has(chave);
                  return (
                    <button
                      key={chave}
                      type="button"
                      className={`disponibilidade__celula${marcado ? ' disponibilidade__celula--marcada' : ''}`}
                      aria-pressed={marcado}
                      aria-label={`${dia.rotulo}, ${turno.rotulo}`}
                      onClick={() => onAlternar(chave)}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="botao botao--primario" disabled={ocupado}>
          Salvar disponibilidade
        </button>
      </div>
    </form>
  );
}

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('');
  const [skills, setSkills] = useState({ oferta: [], demanda: [] });
  const [disciplinas, setDisciplinas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const [disponibilidade, setDisponibilidade] = useState(new Set());

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const [dadosPerfil, dadosSkills, dadosDisciplinas, dadosDisponibilidade] =
          await Promise.all([
            api('/users/perfil'),
            api('/skills'),
            api('/disciplinas'),
            api('/disponibilidade'),
          ]);
        if (!ativo) return;
        setPerfil(dadosPerfil);
        setCurso(dadosPerfil.curso ?? '');
        setSemestre(dadosPerfil.semestre === null ? '' : String(dadosPerfil.semestre));
        setSkills(dadosSkills);
        setDisciplinas(dadosDisciplinas);
        setDisponibilidade(
          new Set(
            dadosDisponibilidade.disponibilidade.map((item) => `${item.dia_semana}:${item.turno}`),
          ),
        );
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

  async function executar(acao, sucesso) {
    setOcupado(true);
    setMensagem('');
    setErroAcao('');

    try {
      await acao();
      setMensagem(sucesso);
      return true;
    } catch (e) {
      setErroAcao(e.message);
      return false;
    } finally {
      setOcupado(false);
    }
  }

  function salvarPerfil(evento) {
    evento.preventDefault();
    return executar(
      () =>
        api('/users/perfil', {
          method: 'PUT',
          body: { curso: curso.trim(), semestre: Number(semestre) },
        }),
      'Perfil atualizado.',
    );
  }

  function adicionar(tipo) {
    return (id_disciplina) =>
      executar(async () => {
        await api(`/skills/${tipo}`, { method: 'POST', body: { id_disciplina } });
        setSkills(await api('/skills'));
      }, 'Disciplina adicionada.');
  }

  function alternarHorario(chave) {
    setDisponibilidade((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }

  function salvarDisponibilidade(evento) {
    evento.preventDefault();
    const itens = DIAS.flatMap((dia) =>
      TURNOS.filter((turno) => disponibilidade.has(`${dia.valor}:${turno.valor}`)).map(
        (turno) => ({ dia_semana: dia.valor, turno: turno.valor }),
      ),
    );

    return executar(
      () => api('/disponibilidade', { method: 'PUT', body: { disponibilidade: itens } }),
      'Disponibilidade salva.',
    );
  }

  const perfilValido = curso.trim() !== '' && semestre !== '';

  return (
    <section className="perfil">
      <header>
        <h1 className="perfil__titulo">Perfil e habilidades</h1>
        <p className="perfil__texto">
          Conte o que você ensina e o que quer aprender: é com isso que o LevelUp conecta você a
          outras pessoas.
        </p>
      </header>

      {carregando && <p className="perfil__texto">Carregando…</p>}

      {erro && (
        <p className="aviso" role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="perfil__ok" role="status">
          {mensagem}
        </p>
      )}

      {erroAcao && (
        <p className="aviso" role="alert">
          {erroAcao}
        </p>
      )}

      {perfil && (
        <>
          <form className="painel perfil__dados" onSubmit={salvarPerfil}>
            <div className="painel__conteudo">
              <p className="perfil__nome">{perfil.nome}</p>
              <p className="perfil__texto">{perfil.email}</p>

              <div className="perfil__campos">
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="curso">
                    Curso
                  </label>
                  <input
                    id="curso"
                    className="campo__entrada"
                    type="text"
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label className="campo__rotulo" htmlFor="semestre">
                    Semestre
                  </label>
                  <input
                    id="semestre"
                    className="campo__entrada"
                    type="number"
                    min="1"
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="botao botao--primario"
                disabled={ocupado || !perfilValido}
              >
                Salvar perfil
              </button>
            </div>
          </form>

          <div className="perfil__blocos">
            <BlocoHabilidade
              titulo="O que eu ensino"
              variante="ensina"
              rotuloLista="Disciplinas que eu ensino"
              rotuloSeletor="Disciplina que eu ensino"
              rotuloBotao="Adicionar ao que eu ensino"
              itens={skills.oferta}
              disciplinas={disciplinas}
              ocupado={ocupado}
              onAdicionar={adicionar('oferta')}
            />
            <BlocoHabilidade
              titulo="O que eu quero aprender"
              variante="aprende"
              rotuloLista="Disciplinas que eu quero aprender"
              rotuloSeletor="Disciplina que eu quero aprender"
              rotuloBotao="Adicionar ao que eu quero aprender"
              itens={skills.demanda}
              disciplinas={disciplinas}
              ocupado={ocupado}
              onAdicionar={adicionar('demanda')}
            />
          </div>
          <QuadroDisponibilidade
            marcados={disponibilidade}
            ocupado={ocupado}
            onAlternar={alternarHorario}
            onSalvar={salvarDisponibilidade}
          />
        </>
      )}
    </section>
  );
}