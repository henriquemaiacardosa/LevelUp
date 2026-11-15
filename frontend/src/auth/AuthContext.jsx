import { createContext, useContext, useEffect, useState } from 'react';
import { api, definirAoSessaoExpirar } from '../services/api';
import { salvarToken, obterToken, limparToken } from '../services/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(() => obterToken() !== null);

  useEffect(() => {
    definirAoSessaoExpirar(() => setAutenticado(false));
    return () => definirAoSessaoExpirar(null);
  }, []);

  async function entrar(email, senha) {
    const { token } = await api('/auth/login', {
      method: 'POST',
      body: { email, senha },
    });
    salvarToken(token);
    setAutenticado(true);
  }

  function sair() {
    limparToken();
    setAutenticado(false);
  }

  return (
    <AuthContext.Provider value={{ autenticado, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return contexto;
}