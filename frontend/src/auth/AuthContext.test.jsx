import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../services/api';
import { salvarToken, obterToken } from '../services/tokenStorage';

vi.mock('../services/api');

function Painel() {
  const { autenticado, entrar, sair } = useAuth();
  const [erro, setErro] = useState('');

  async function aoEntrar() {
    try {
      await entrar('a@b.com', 'senha123');
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div>
      <span data-testid="estado">{autenticado ? 'logado' : 'deslogado'}</span>
      {erro && <p role="alert">{erro}</p>}
      <button onClick={aoEntrar}>entrar</button>
      <button onClick={sair}>sair</button>
    </div>
  );
}

function renderizar() {
  return render(
    <AuthProvider>
      <Painel />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('sem token salvo começa deslogado', () => {
    renderizar();

    expect(screen.getByTestId('estado')).toHaveTextContent('deslogado');
  });

  test('com token salvo começa logado', () => {
    salvarToken('abc123');

    renderizar();

    expect(screen.getByTestId('estado')).toHaveTextContent('logado');
  });

  test('entrar chama o login, guarda o token e passa a logado', async () => {
    api.mockResolvedValue({ token: 'token-novo' });
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'entrar' }));

    expect(api).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', senha: 'senha123' },
    });
    expect(await screen.findByText('logado')).toBeInTheDocument();
    expect(obterToken()).toBe('token-novo');
  });

  test('login com erro propaga a mensagem e continua deslogado', async () => {
    api.mockRejectedValue(new Error('Credenciais inválidas'));
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas');
    expect(screen.getByTestId('estado')).toHaveTextContent('deslogado');
    expect(obterToken()).toBeNull();
  });

  test('sair apaga o token e volta a deslogado', async () => {
    salvarToken('abc123');
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'sair' }));

    expect(screen.getByTestId('estado')).toHaveTextContent('deslogado');
    expect(obterToken()).toBeNull();
  });
});