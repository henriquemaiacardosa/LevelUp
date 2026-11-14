import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { api } from '../services/api';
import Tutor from './Tutor';

vi.mock('../services/api');

const DETALHES = {
  id_usuario: 12,
  nome: 'Maria',
  curso: 'Engenharia de Software',
  semestre: 5,
  xp_ensino: 150,
  xp_total: 170,
  nivel: 2,
  disciplinas: [
    { id_disciplina: 3, nome_disciplina: 'Cálculo I' },
    { id_disciplina: 5, nome_disciplina: 'Programação' },
  ],
  disponibilidade: [
    { dia_semana: 'SEGUNDA', turno: 'MANHA' },
    { dia_semana: 'SEGUNDA', turno: 'NOITE' },
    { dia_semana: 'SABADO', turno: 'TARDE' },
  ],
};

function renderizar(detalhes = DETALHES) {
  api.mockResolvedValue(detalhes);
  render(
    <MemoryRouter initialEntries={['/tutores/12']}>
      <Routes>
        <Route path="/tutores/:id" element={<Tutor />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Tutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra o carregamento e busca o tutor pelo id da URL', async () => {
    renderizar();

    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Maria' })).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('/tutores/12');
  });

  test('mostra curso e semestre', async () => {
    renderizar();

    await screen.findByRole('heading', { name: 'Maria' });
    expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
    expect(screen.getByText('5º semestre')).toBeInTheDocument();
  });

  test('curso e semestre nulos mostram o aviso e escondem o semestre', async () => {
    renderizar({ ...DETALHES, curso: null, semestre: null });

    await screen.findByRole('heading', { name: 'Maria' });
    expect(screen.getByText('Curso não informado')).toBeInTheDocument();
    expect(screen.queryByText(/º semestre/)).not.toBeInTheDocument();
  });

  test('mostra o nível e a pontuação', async () => {
    renderizar();

    await screen.findByRole('heading', { name: 'Maria' });
    expect(screen.getByText('Nível 2')).toBeInTheDocument();
    expect(screen.getByText('150 XP de ensino')).toBeInTheDocument();
    expect(screen.getByText('170 XP no total')).toBeInTheDocument();
  });

  test('lista as disciplinas que o tutor ensina', async () => {
    renderizar();

    await screen.findByRole('heading', { name: 'Maria' });
    const lista = screen.getByRole('list', { name: 'Disciplinas que ensina' });
    expect(within(lista).getByText('Cálculo I')).toBeInTheDocument();
    expect(within(lista).getByText('Programação')).toBeInTheDocument();
  });

  test('mostra os horários agrupados por dia', async () => {
    renderizar();

    await screen.findByRole('heading', { name: 'Maria' });
    const lista = screen.getByRole('list', { name: 'Horários disponíveis' });
    const itens = within(lista).getAllByRole('listitem');
    expect(itens).toHaveLength(2);
    expect(itens[0]).toHaveTextContent('Segunda: manhã, noite');
    expect(itens[1]).toHaveTextContent('Sábado: tarde');
  });

  test('tutor sem horários mostra um aviso', async () => {
    renderizar({ ...DETALHES, disponibilidade: [] });

    await screen.findByRole('heading', { name: 'Maria' });
    expect(screen.getByText('Este tutor ainda não informou horários.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Horários disponíveis' })).not.toBeInTheDocument();
  });

  test('erro mostra a mensagem do backend', async () => {
    api.mockRejectedValue(new Error('Tutor não encontrado.'));
    render(
      <MemoryRouter initialEntries={['/tutores/99']}>
        <Routes>
          <Route path="/tutores/:id" element={<Tutor />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Tutor não encontrado.');
  });

  test('tem um link para voltar à busca', async () => {
    renderizar();

    await screen.findByRole('heading', { name: 'Maria' });
    expect(screen.getByRole('link', { name: 'Voltar à busca' })).toHaveAttribute('href', '/buscar');
  });
});