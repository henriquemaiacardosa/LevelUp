import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../services/api';
import Busca from './Busca';

vi.mock('../services/api');

const DISCIPLINAS = [
  { id_disciplina: 1, nome_disciplina: 'Cálculo I', area_conhecimento: 'Exatas' },
  { id_disciplina: 2, nome_disciplina: 'Programação', area_conhecimento: null },
];

const TUTORES = [
  { id_usuario: 11, nome: 'Tutor Teste', curso: 'Engenharia de Software', semestre: 7 },
  { id_usuario: 13, nome: 'Ana', curso: null, semestre: null },
];

function prepararApi({ tutores = TUTORES, aoSolicitar } = {}) {
  api.mockImplementation(async (caminho, opcoes) => {
    if (caminho === '/disciplinas') return DISCIPLINAS;
    if (caminho === '/matchmaking?id_disciplina=2') return tutores;
    if (caminho === '/mentorias' && opcoes?.method === 'POST') {
      return aoSolicitar ? aoSolicitar(opcoes) : { id_mentoria: 9, status: 'PENDENTE' };
    }
    throw new Error(`chamada inesperada: ${caminho}`);
  });
}

function renderizar() {
  return render(
    <MemoryRouter>
      <Busca />
    </MemoryRouter>
  );
}

async function buscarProgramacao() {
  await userEvent.selectOptions(await screen.findByLabelText('Disciplina'), '2');
  await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));
}

describe('Busca', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega as disciplinas no seletor', async () => {
    prepararApi();

    renderizar();

    expect(await screen.findByRole('option', { name: 'Cálculo I' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Programação' })).toBeInTheDocument();
  });

  test('o botão Buscar só habilita depois de escolher a disciplina', async () => {
    prepararApi();
    renderizar();

    const botao = screen.getByRole('button', { name: 'Buscar' });
    expect(botao).toBeDisabled();

    await userEvent.selectOptions(await screen.findByLabelText('Disciplina'), '2');

    expect(botao).toBeEnabled();
  });

  test('busca os tutores da disciplina e mostra os cartões', async () => {
    prepararApi();
    renderizar();

    await buscarProgramacao();

    expect(await screen.findByText('Tutor Teste')).toBeInTheDocument();
    expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
    expect(screen.getByText('7º semestre')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Curso não informado')).toBeInTheDocument();
  });

  test('sem tutores mostra uma mensagem clara', async () => {
    prepararApi({ tutores: [] });
    renderizar();

    await buscarProgramacao();

    expect(
      await screen.findByText('Nenhum tutor encontrado para esta disciplina.')
    ).toBeInTheDocument();
  });

  test('erro na busca mostra a mensagem do backend', async () => {
    api.mockImplementation(async (caminho) => {
      if (caminho === '/disciplinas') return DISCIPLINAS;
      throw new Error('Não foi possível conectar ao servidor.');
    });
    renderizar();

    await buscarProgramacao();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao servidor.'
    );
  });

  test('erro ao carregar as disciplinas mostra um alerta', async () => {
    api.mockRejectedValue(new Error('Erro inesperado. Tente novamente.'));

    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Erro inesperado. Tente novamente.');
  });

  test('solicitar mentoria envia o tutor, a disciplina e a data em formato ISO', async () => {
    prepararApi();
    renderizar();
    await buscarProgramacao();

    const botoes = await screen.findAllByRole('button', { name: 'Solicitar mentoria' });
    await userEvent.click(botoes[0]);
    fireEvent.change(screen.getByLabelText('Data e hora'), {
      target: { value: '2026-12-01T14:30' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitação' }));

    expect(api).toHaveBeenCalledWith('/mentorias', {
      method: 'POST',
      body: {
        id_tutor: 11,
        id_disciplina: 2,
        data_hora: new Date('2026-12-01T14:30').toISOString(),
      },
    });
    expect(await screen.findByText('Solicitação enviada para Tutor Teste.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver minhas mentorias' })).toHaveAttribute(
      'href',
      '/mentorias'
    );
  });

  test('erro ao solicitar mostra a mensagem do backend e mantém o formulário', async () => {
    prepararApi({
      aoSolicitar: () => {
        throw new Error('A data da mentoria deve ser futura.');
      },
    });
    renderizar();
    await buscarProgramacao();

    const botoes = await screen.findAllByRole('button', { name: 'Solicitar mentoria' });
    await userEvent.click(botoes[0]);
    fireEvent.change(screen.getByLabelText('Data e hora'), {
      target: { value: '2020-01-01T10:00' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Enviar solicitação' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A data da mentoria deve ser futura.');
    expect(screen.getByLabelText('Data e hora')).toBeInTheDocument();
  });
});