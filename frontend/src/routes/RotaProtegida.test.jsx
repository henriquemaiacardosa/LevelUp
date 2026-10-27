import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { salvarToken } from '../services/tokenStorage';
import RotaProtegida from './RotaProtegida';

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/privada']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<RotaProtegida />}>
            <Route path="/privada" element={<p>conteúdo privado</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('RotaProtegida', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deslogado é redirecionado para /login', () => {
    renderizar();

    expect(screen.getByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText('conteúdo privado')).not.toBeInTheDocument();
  });

  test('logado vê o conteúdo da rota', () => {
    salvarToken('abc123');

    renderizar();

    expect(screen.getByText('conteúdo privado')).toBeInTheDocument();
    expect(screen.queryByText('tela de login')).not.toBeInTheDocument();
  });
});