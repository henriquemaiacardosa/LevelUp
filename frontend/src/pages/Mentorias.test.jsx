import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../services/api';
import Mentorias from './Mentorias';

vi.mock('../services/api');

function mentoria(campos = {}) {
  return {
    id_mentoria: 1,
    status: 'PENDENTE',
    data_hora: '2026-12-01T14:00:00.000Z',
    papel: 'ALUNO',
    outra_pessoa: { id_usuario: 11, nome: 'Tutor Teste' },
    disciplina: 'Cálculo I',
    link_videochamada: null,
    ...campos,
  };
}

const LISTA = [
  mentoria({ id_mentoria: 1, status: 'PENDENTE', disciplina: 'Cálculo I' }),
  mentoria({ id_mentoria: 2, status: 'PENDENTE', disciplina: 'Física', papel: 'TUTOR', outra_pessoa: { id_usuario: 12, nome: 'Ana' } }),
  mentoria({ id_mentoria: 3, status: 'CONFIRMADA', disciplina: 'Programação' }),
  mentoria({ id_mentoria: 4, status: 'CONCLUIDA', disciplina: 'Química' }),
  mentoria({ id_mentoria: 5, status: 'CANCELADA', disciplina: 'Biologia' }),
];

function renderizar(lista = LISTA) {
  api.mockResolvedValue(lista);
  return render(<Mentorias />);
}

describe('Mentorias - lista com abas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra o carregamento e busca a lista na api', async () => {
    renderizar();

    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: 'Pendentes (2)' })).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('/mentorias');
  });

  test('as abas mostram a contagem de cada status', async () => {
    renderizar();

    expect(await screen.findByRole('tab', { name: 'Pendentes (2)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Confirmadas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Concluídas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Canceladas (1)' })).toBeInTheDocument();
  });

  test('começa na aba Pendentes, só com as pendentes', async () => {
    renderizar();

    expect(await screen.findByText('Cálculo I')).toBeInTheDocument();
    expect(screen.getByText('Física')).toBeInTheDocument();
    expect(screen.queryByText('Programação')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pendentes (2)' })).toHaveAttribute('aria-selected', 'true');
  });

  test('trocar de aba mostra só as mentorias daquele status', async () => {
    renderizar();

    await userEvent.click(await screen.findByRole('tab', { name: 'Confirmadas (1)' }));

    expect(screen.getByText('Programação')).toBeInTheDocument();
    expect(screen.queryByText('Cálculo I')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Concluídas (1)' }));
    expect(screen.getByText('Química')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Canceladas (1)' }));
    expect(screen.getByText('Biologia')).toBeInTheDocument();
  });

  test('mostra o papel do usuário e a outra pessoa', async () => {
    renderizar();

    expect(await screen.findByText('Você aprende com Tutor Teste')).toBeInTheDocument();
    expect(screen.getByText('Você ensina Ana')).toBeInTheDocument();
  });

  test('aluno vê o link da videochamada de uma mentoria confirmada', async () => {
    renderizar([
      mentoria({ id_mentoria: 3, status: 'CONFIRMADA', link_videochamada: 'https://meet.google.com/abc' }),
    ]);

    await userEvent.click(await screen.findByRole('tab', { name: 'Confirmadas (1)' }));

    const link = screen.getByRole('link', { name: 'Entrar na videochamada' });
    expect(link).toHaveAttribute('href', 'https://meet.google.com/abc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  test('aluno sem link vê que o tutor ainda não enviou', async () => {
    renderizar([mentoria({ id_mentoria: 3, status: 'CONFIRMADA', link_videochamada: null })]);

    await userEvent.click(await screen.findByRole('tab', { name: 'Confirmadas (1)' }));

    expect(screen.getByText('O tutor ainda não enviou o link.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Entrar na videochamada' })).not.toBeInTheDocument();
  });

  test('link que não é http ou https nunca vira um link clicável', async () => {
    renderizar([
      mentoria({ id_mentoria: 3, status: 'CONFIRMADA', link_videochamada: 'javascript:alert(1)' }),
    ]);

    await userEvent.click(await screen.findByRole('tab', { name: 'Confirmadas (1)' }));

    expect(screen.queryByRole('link', { name: 'Entrar na videochamada' })).not.toBeInTheDocument();
    expect(screen.getByText('O tutor ainda não enviou o link.')).toBeInTheDocument();
  });

  test('aba sem mentorias mostra uma mensagem', async () => {
    renderizar([mentoria({ id_mentoria: 1, status: 'PENDENTE' })]);

    await userEvent.click(await screen.findByRole('tab', { name: 'Concluídas (0)' }));

    expect(screen.getByText('Nenhuma mentoria nesta aba.')).toBeInTheDocument();
  });

  test('erro ao carregar mostra a mensagem do backend', async () => {
    api.mockRejectedValue(new Error('Não foi possível conectar ao servidor.'));
    render(<Mentorias />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor.');
  });
});