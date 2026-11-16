import { act, render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { definirAoSessaoExpirar } from '../services/api';
import { salvarToken } from '../services/tokenStorage';

vi.mock('../services/api');

function Estado() {
  const { autenticado } = useAuth();
  return <span data-testid="estado">{autenticado ? 'logado' : 'deslogado'}</span>;
}

describe('AuthContext - sessão expirada', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('quando a api avisa que a sessão expirou, passa a deslogado', () => {
    salvarToken('abc123');
    render(
      <AuthProvider>
        <Estado />
      </AuthProvider>,
    );
    expect(screen.getByTestId('estado')).toHaveTextContent('logado');

    const aoExpirar = definirAoSessaoExpirar.mock.calls[0][0];
    act(() => aoExpirar());

    expect(screen.getByTestId('estado')).toHaveTextContent('deslogado');
  });
});