import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../services/api';
import ExcluirConta from './ExcluirConta';

const { sair } = vi.hoisted(() => ({ sair: vi.fn() }));

vi.mock('../services/api');
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ sair }),
}));

describe('ExcluirConta (LGPD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('começa só com o botão, sem pedir confirmação', () => {
    render(<ExcluirConta />);

    expect(screen.getByRole('heading', { name: 'Privacidade (LGPD)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir minha conta' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).not.toBeInTheDocument();
  });

  test('ao clicar em excluir, avisa que não tem volta e pede confirmação sem chamar a API', async () => {
    render(<ExcluirConta />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));

    expect(screen.getByText(/não pode ser desfeita/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar exclusão' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  test('cancelar volta ao começo sem chamar a API', async () => {
    render(<ExcluirConta />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('button', { name: 'Excluir minha conta' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).not.toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
    expect(sair).not.toHaveBeenCalled();
  });

  test('confirmar chama DELETE /users/perfil e depois encerra a sessão', async () => {
    api.mockResolvedValue(null);
    render(<ExcluirConta />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    await waitFor(() => expect(sair).toHaveBeenCalledTimes(1));
    expect(api).toHaveBeenCalledWith('/users/perfil', { method: 'DELETE' });
  });

  test('se a API falhar, mostra o erro e não encerra a sessão', async () => {
    api.mockRejectedValue(new Error('Erro interno do servidor.'));
    render(<ExcluirConta />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro interno do servidor.');
    expect(sair).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Confirmar exclusão' })).toBeEnabled()
    );
  });

  test('enquanto exclui, desabilita os botões para evitar clique duplo', async () => {
    api.mockReturnValue(new Promise(() => {}));
    render(<ExcluirConta />);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));

    expect(screen.getByRole('button', { name: 'Confirmar exclusão' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});