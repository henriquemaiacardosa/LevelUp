import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../services/api';
import Inicio from './Inicio';

vi.mock('../services/api');

const PERFIL = { id_usuario: 11, nome: 'Maria Silva', email: 'm@b.com', curso: null, semestre: null };
const XP = { xp_ensino: 120, xp_aprendizado: 50, xp_total: 170, nivel: 2 };

function mentoria(campos = {}) {
  return {
    id_mentoria: 1,
    status: 'CONFIRMADA',
    data_hora: '2026-11-01T14:00:00.000Z',
    papel: 'ALUNO',
    outra_pessoa: { id_usuario: 12, nome: 'Tutor Teste' },
    disciplina: 'Cálculo I',
    link_videochamada: null,
    ...campos,
  };
}

function prepararApi({ perfil = PERFIL, xp = XP, mentorias = [] } = {}) {
  api.mockImplementation(async (caminho) => {
    if (caminho === '/users/perfil') return perfil;
    if (caminho === '/users/xp') return xp;
    if (caminho === '/mentorias') return mentorias;
    throw new Error(`chamada inesperada: ${caminho}`);
  });
}

function renderizar() {
  return render(
    <MemoryRouter>
      <Inicio />
    </MemoryRouter>
  );
}

describe('Inicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra o estado de carregamento antes dos dados', () => {
    prepararApi();

    renderizar();

    expect(screen.getByText('Carregando…')).toBeInTheDocument();
  });

  test('saúda o usuário pelo primeiro nome', async () => {
    prepararApi();

    renderizar();

    expect(await screen.findByRole('heading', { name: 'Olá, Maria' })).toBeInTheDocument();
  });

  test('mostra o nível, o progresso e os dois tipos de XP', async () => {
    prepararApi();

    renderizar();

    expect(await screen.findByText('Nível 2')).toBeInTheDocument();
    expect(screen.getByText('70 de 100 XP para o nível 3')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Progresso do nível' })).toHaveAttribute(
      'aria-valuenow',
      '70'
    );
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('XP de ensino')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('XP de aprendizado')).toBeInTheDocument();
  });

  test('mostra os atalhos para aprender e ensinar', async () => {
    prepararApi();

    renderizar();

    expect(await screen.findByRole('link', { name: 'Quero aprender' })).toHaveAttribute('href', '/buscar');
    expect(screen.getByRole('link', { name: 'Quero ensinar' })).toHaveAttribute('href', '/perfil');
  });

  test('lista só mentorias pendentes e confirmadas', async () => {
    prepararApi({
      mentorias: [
        mentoria({ id_mentoria: 1, status: 'CONFIRMADA', disciplina: 'Cálculo I' }),
        mentoria({ id_mentoria: 2, status: 'PENDENTE', disciplina: 'Programação', papel: 'TUTOR', outra_pessoa: { id_usuario: 13, nome: 'Ana' } }),
        mentoria({ id_mentoria: 3, status: 'CONCLUIDA', disciplina: 'Física' }),
        mentoria({ id_mentoria: 4, status: 'CANCELADA', disciplina: 'Química' }),
      ],
    });

    renderizar();

    expect(await screen.findByText('Cálculo I')).toBeInTheDocument();
    expect(screen.getByText('Programação')).toBeInTheDocument();
    expect(screen.getByText(/Tutor Teste/)).toBeInTheDocument();
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
    expect(screen.queryByText('Física')).not.toBeInTheDocument();
    expect(screen.queryByText('Química')).not.toBeInTheDocument();
  });

  test('mostra no máximo 3 mentorias', async () => {
    prepararApi({
      mentorias: [1, 2, 3, 4].map((id) =>
        mentoria({ id_mentoria: id, disciplina: `Disciplina ${id}` })
      ),
    });

    renderizar();

    expect(await screen.findByText('Disciplina 1')).toBeInTheDocument();
    expect(screen.getByText('Disciplina 3')).toBeInTheDocument();
    expect(screen.queryByText('Disciplina 4')).not.toBeInTheDocument();
  });

  test('sem mentorias agendadas convida a buscar um tutor', async () => {
    prepararApi({ mentorias: [] });

    renderizar();

    expect(await screen.findByText('Você ainda não tem mentorias agendadas.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buscar tutores' })).toHaveAttribute('href', '/buscar');
  });

  test('mostra a mensagem de erro quando uma chamada falha', async () => {
    api.mockRejectedValue(new Error('Não foi possível conectar ao servidor.'));

    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar ao servidor.');
  });
});