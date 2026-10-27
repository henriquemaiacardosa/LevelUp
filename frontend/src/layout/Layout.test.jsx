import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import RotaProtegida from '../routes/RotaProtegida';
import { salvarToken, obterToken } from '../services/tokenStorage';
import Layout from './Layout';

function renderizar(rotaInicial = '/') {
  return render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route path="/" element={<p>conteúdo do início</p>} />
              <Route path="/mentorias" element={<p>conteúdo das mentorias</p>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
    salvarToken('abc123');
  });

  test('mostra a marca e os links de navegação', () => {
    renderizar();

    expect(screen.getByText('LevelUp')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Buscar tutores' })).toHaveAttribute('href', '/buscar');
    expect(screen.getByRole('link', { name: 'Minhas mentorias' })).toHaveAttribute('href', '/mentorias');
    expect(screen.getByRole('link', { name: 'Ranking' })).toHaveAttribute('href', '/ranking');
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil');
  });

  test('mostra o conteúdo da rota abaixo do cabeçalho', () => {
    renderizar();

    expect(screen.getByText('conteúdo do início')).toBeInTheDocument();
  });

  test('marca o link da página atual', () => {
    renderizar('/mentorias');

    expect(screen.getByRole('link', { name: 'Minhas mentorias' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current');
  });

  test('Sair apaga o token e volta para o login', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(await screen.findByText('tela de login')).toBeInTheDocument();
    expect(obterToken()).toBeNull();
  });
});