import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './Ranking.css';

function Linha({ entrada, minhaPosicao }) {
  const sou = minhaPosicao !== null && entrada.posicao === minhaPosicao;

  return (
    <li className={`posicao ${sou ? 'posicao--voce' : ''}`}>
      <span className="posicao__numero">{`${entrada.posicao}º`}</span>
      <span className="posicao__nome">{entrada.nome}</span>
      {sou && <span className="posicao__selo">Você</span>}
      <span className="posicao__xp">{`${entrada.xp_total} XP`}</span>
    </li>
  );
}

export default function Ranking() {
  const [ranking, setRanking] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await api('/leaderboard');
        if (ativo) setRanking(resposta);
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

  const top = ranking ? ranking.top : [];
  const minha = ranking ? ranking.minha_posicao : null;
  const minhaPosicao = minha ? minha.posicao : null;
  const podio = top.slice(0, 3);
  const demais = top.slice(3);

  return (
    <section className="ranking">
      <header>
        <h1 className="ranking__titulo">Ranking</h1>
        <p className="ranking__texto">Quem mais soma XP ensinando e aprendendo.</p>
      </header>

      {carregando && <p className="ranking__texto">Carregando…</p>}

      {erro && (
        <p className="aviso" role="alert">
          {erro}
        </p>
      )}

      {ranking && top.length === 0 && (
        <p className="ranking__vazio">Ninguém pontuou ainda.</p>
      )}

      {ranking && top.length > 0 && (
        <>
          {minha ? (
            <p className="ranking__voce">
              {`Você está em ${minha.posicao}º lugar com ${minha.xp_total} XP.`}
            </p>
          ) : (
            <p className="ranking__voce">Conclua uma mentoria para entrar no ranking.</p>
          )}

          <ol className="podio" aria-label="Pódio">
            {podio.map((entrada) => (
              <Linha key={entrada.posicao} entrada={entrada} minhaPosicao={minhaPosicao} />
            ))}
          </ol>

          {demais.length > 0 && (
            <ol className="demais" aria-label="Demais posições" start={4}>
              {demais.map((entrada) => (
                <Linha key={entrada.posicao} entrada={entrada} minhaPosicao={minhaPosicao} />
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}