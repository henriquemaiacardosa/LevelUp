import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import './ExcluirConta.css';

export default function ExcluirConta() {
  const { sair } = useAuth();
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  async function excluir() {
    setOcupado(true);
    setErro('');

    try {
      await api('/users/perfil', { method: 'DELETE' });
      sair();
    } catch (e) {
      setErro(e.message);
      setOcupado(false);
    }
  }

  function cancelar() {
    setConfirmando(false);
    setErro('');
  }

  return (
    <section className="painel exclusao">
      <div className="painel__conteudo">
        <h2 className="exclusao__titulo">Privacidade (LGPD)</h2>
        <p className="perfil__texto">
          Você pode excluir sua conta a qualquer momento. Seus dados pessoais são anonimizados,
          suas disciplinas e disponibilidade são apagadas e as mentorias pendentes ou confirmadas
          são canceladas.
        </p>

        {erro && (
          <p className="aviso" role="alert">
            {erro}
          </p>
        )}

        {confirmando ? (
          <div className="exclusao__confirmacao">
            <p className="exclusao__aviso">
              Esta ação não pode ser desfeita. Tem certeza de que deseja excluir sua conta?
            </p>
            <div className="exclusao__acoes">
              <button
                type="button"
                className="botao botao--perigo"
                disabled={ocupado}
                onClick={excluir}
              >
                Confirmar exclusão
              </button>
              <button type="button" className="botao" disabled={ocupado} onClick={cancelar}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="botao botao--perigo"
            onClick={() => setConfirmando(true)}
          >
            Excluir minha conta
          </button>
        )}
      </div>
    </section>
  );
}