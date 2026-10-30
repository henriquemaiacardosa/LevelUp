import { render, screen, within } from '@testing-library/react';
import { api } from '../services/api';
import Ranking from './Ranking';

vi.mock('../services/api');

const TOP = [
  { posicao: 1, nome: 'Ana', xp_total: 70 },
  { posicao: 2, nome: 'Bruno', xp_total: 60 },
  { posicao: 3, nome: 'Carla', xp_total: 50 },
  { posicao: 4, nome: 'Diego', xp_total: 40 },
  { posicao: 5, nome: 'Elisa', xp_total: 30 },
];

function renderizar(resposta = { top: TOP, minha_posicao: null }) {
  api.mockResolvedValue(resposta);
  return render(<Ranking />);
}

describe('Ranking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra o carregamento e busca o ranking na api', async () => {
    renderizar();

    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(await screen.findByRole('list', { name: 'Pódio' })).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('/leaderboard');
  });

  test('o pódio mostra os 3 primeiros com posição, nome e XP', async () => {
    renderizar();

    const podio = await screen.findByRole('list', { name: 'Pódio' });
    const itens = within(podio).getAllByRole('listitem');

    expect(itens).toHaveLength(3);
    expect(within(itens[0]).getByText('1º')).toBeInTheDocument();
    expect(within(itens[0]).getByText('Ana')).toBeInTheDocument();
    expect(within(itens[0]).getByText('70 XP')).toBeInTheDocument();
    expect(within(itens[1]).getByText('Bruno')).toBeInTheDocument();
    expect(within(itens[2]).getByText('Carla')).toBeInTheDocument();
  });

  test('as demais posições aparecem em uma lista separada', async () => {
    renderizar();

    const demais = await screen.findByRole('list', { name: 'Demais posições' });
    const itens = within(demais).getAllByRole('listitem');

    expect(itens).toHaveLength(2);
    expect(within(itens[0]).getByText('4º')).toBeInTheDocument();
    expect(within(itens[0]).getByText('Diego')).toBeInTheDocument();
    expect(within(itens[0]).getByText('40 XP')).toBeInTheDocument();
    expect(within(itens[1]).getByText('Elisa')).toBeInTheDocument();
  });

  test('com menos de 4 pessoas não mostra a lista de demais posições', async () => {
    renderizar({ top: TOP.slice(0, 2), minha_posicao: null });

    const podio = await screen.findByRole('list', { name: 'Pódio' });

    expect(within(podio).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('list', { name: 'Demais posições' })).not.toBeInTheDocument();
  });

  test('mostra a posição do usuário quando ele está fora do top', async () => {
    renderizar({ top: TOP, minha_posicao: { posicao: 11, xp_total: 90 } });

    expect(await screen.findByText('Você está em 11º lugar com 90 XP.')).toBeInTheDocument();
  });

  test('marca a linha do usuário quando ele está no top', async () => {
    renderizar({ top: TOP, minha_posicao: { posicao: 2, xp_total: 60 } });

    const podio = await screen.findByRole('list', { name: 'Pódio' });
    const itens = within(podio).getAllByRole('listitem');

    expect(within(itens[1]).getByText('Você')).toBeInTheDocument();
    expect(within(itens[0]).queryByText('Você')).not.toBeInTheDocument();
  });

  test('marca a linha do usuário também nas demais posições', async () => {
    renderizar({ top: TOP, minha_posicao: { posicao: 5, xp_total: 30 } });

    const demais = await screen.findByRole('list', { name: 'Demais posições' });
    const itens = within(demais).getAllByRole('listitem');

    expect(within(itens[1]).getByText('Você')).toBeInTheDocument();
  });

  test('sem XP ainda, convida a concluir uma mentoria', async () => {
    renderizar({ top: TOP, minha_posicao: null });

    expect(
      await screen.findByText('Conclua uma mentoria para entrar no ranking.'),
    ).toBeInTheDocument();
  });

  test('ranking vazio mostra uma mensagem', async () => {
    renderizar({ top: [], minha_posicao: null });

    expect(await screen.findByText('Ninguém pontuou ainda.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Pódio' })).not.toBeInTheDocument();
  });

  test('erro ao carregar mostra a mensagem do backend', async () => {
    api.mockRejectedValue(new Error('Não foi possível conectar ao servidor.'));
    render(<Ranking />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao servidor.',
    );
  });
});