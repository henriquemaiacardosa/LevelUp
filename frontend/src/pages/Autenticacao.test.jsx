import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { api } from '../services/api';
import Autenticacao from './Autenticacao';

vi.mock('../services/api');

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Autenticacao />} />
          <Route path="/" element={<p>página inicial</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Autenticacao', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('começa na aba Entrar, com e-mail e senha', () => {
    renderizar();

    expect(screen.getByRole('tab', { name: 'Entrar' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument();
  });

  test('a aba Criar conta mostra o campo Nome', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
  });

  test('login com sucesso chama a api e vai para a página inicial', async () => {
    api.mockResolvedValue({ token: 'token-novo' });
    renderizar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: 'Acessar' }));

    expect(api).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', senha: 'senha123' },
    });
    expect(await screen.findByText('página inicial')).toBeInTheDocument();
  });

  test('login com erro mostra a mensagem do backend e não navega', async () => {
    api.mockRejectedValue(new Error('Credenciais inválidas'));
    renderizar();

    await userEvent.type(screen.getByLabelText('E-mail'), 'a@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Acessar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas');
    expect(screen.queryByText('página inicial')).not.toBeInTheDocument();
  });

  test('cadastro cria a conta, entra automaticamente e vai para a página inicial', async () => {
    api.mockImplementation(async (caminho) =>
      caminho === '/auth/cadastro' ? { id_usuario: 1 } : { token: 'token-novo' }
    );
    renderizar();

    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Maria');
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(api).toHaveBeenNthCalledWith(1, '/auth/cadastro', {
      method: 'POST',
      body: { nome: 'Maria', email: 'maria@b.com', senha: 'senha123' },
    });
    expect(api).toHaveBeenNthCalledWith(2, '/auth/login', {
      method: 'POST',
      body: { email: 'maria@b.com', senha: 'senha123' },
    });
    expect(await screen.findByText('página inicial')).toBeInTheDocument();
  });

  test('cadastro com erro mostra a mensagem do backend e não entra', async () => {
    api.mockRejectedValue(new Error('E-mail já cadastrado.'));
    renderizar();

    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }));
    await userEvent.type(screen.getByLabelText('Nome'), 'Maria');
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@b.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail já cadastrado.');
    expect(api).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('página inicial')).not.toBeInTheDocument();
  });
});