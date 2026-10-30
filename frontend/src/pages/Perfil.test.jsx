import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../services/api';
import Perfil from './Perfil';

vi.mock('../services/api');

const PERFIL = {
  id_usuario: 1,
  nome: 'Henrique Maia',
  email: 'henrique@teste.com',
  curso: 'Engenharia de Software',
  semestre: 7,
};

const DISCIPLINAS = [
  { id_disciplina: 3, nome_disciplina: 'Cálculo I' },
  { id_disciplina: 4, nome_disciplina: 'Física' },
  { id_disciplina: 5, nome_disciplina: 'Programação' },
];

const SKILLS = {
  oferta: [{ id_habilidade: 1, id_disciplina: 3, nome_disciplina: 'Cálculo I' }],
  demanda: [],
};

function configurarApi({ perfil = PERFIL, skills = SKILLS, escrita = () => Promise.resolve({}) } = {}) {
  const estado = { perfil, skills };
  api.mockImplementation((caminho, opcoes) => {
    if (opcoes && opcoes.method) return escrita(caminho, opcoes);
    if (caminho === '/users/perfil') return Promise.resolve(estado.perfil);
    if (caminho === '/skills') return Promise.resolve(estado.skills);
    if (caminho === '/disciplinas') return Promise.resolve(DISCIPLINAS);
    return Promise.reject(new Error(`caminho inesperado: ${caminho}`));
  });
  return estado;
}

async function renderizar(opcoes) {
  const estado = configurarApi(opcoes);
  render(<Perfil />);
  await screen.findByLabelText('Curso');
  return estado;
}

describe('Perfil - dados pessoais', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mostra o carregamento e busca perfil, habilidades e disciplinas', async () => {
    configurarApi();
    render(<Perfil />);

    expect(screen.getByText('Carregando…')).toBeInTheDocument();
    expect(await screen.findByLabelText('Curso')).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith('/users/perfil');
    expect(api).toHaveBeenCalledWith('/skills');
    expect(api).toHaveBeenCalledWith('/disciplinas');
  });

  test('mostra nome e e-mail e preenche curso e semestre', async () => {
    await renderizar();

    expect(screen.getByText('Henrique Maia')).toBeInTheDocument();
    expect(screen.getByText('henrique@teste.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Curso')).toHaveValue('Engenharia de Software');
    expect(screen.getByLabelText('Semestre')).toHaveValue(7);
  });

  test('curso e semestre nulos aparecem como campos vazios', async () => {
    await renderizar({ perfil: { ...PERFIL, curso: null, semestre: null } });

    expect(screen.getByLabelText('Curso')).toHaveValue('');
    expect(screen.getByLabelText('Semestre')).toHaveValue(null);
  });

  test('salva curso e semestre com PUT e avisa', async () => {
    await renderizar();

    const curso = screen.getByLabelText('Curso');
    await userEvent.clear(curso);
    await userEvent.type(curso, 'Sistemas de Informação');
    const semestre = screen.getByLabelText('Semestre');
    await userEvent.clear(semestre);
    await userEvent.type(semestre, '5');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));

    expect(api).toHaveBeenCalledWith('/users/perfil', {
      method: 'PUT',
      body: { curso: 'Sistemas de Informação', semestre: 5 },
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Perfil atualizado.');
  });

  test('salvar perfil fica desabilitado com curso ou semestre vazios', async () => {
    await renderizar();

    await userEvent.clear(screen.getByLabelText('Semestre'));
    expect(screen.getByRole('button', { name: 'Salvar perfil' })).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Semestre'), '3');
    expect(screen.getByRole('button', { name: 'Salvar perfil' })).toBeEnabled();

    await userEvent.clear(screen.getByLabelText('Curso'));
    expect(screen.getByRole('button', { name: 'Salvar perfil' })).toBeDisabled();
  });

  test('erro ao salvar mostra a mensagem do backend e mantém o que foi digitado', async () => {
    await renderizar({ escrita: () => Promise.reject(new Error('Semestre inválido.')) });

    const semestre = screen.getByLabelText('Semestre');
    await userEvent.clear(semestre);
    await userEvent.type(semestre, '99');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Semestre inválido.');
    expect(screen.getByLabelText('Semestre')).toHaveValue(99);
  });

  test('erro ao carregar mostra a mensagem do backend', async () => {
    api.mockRejectedValue(new Error('Não foi possível conectar ao servidor.'));
    render(<Perfil />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível conectar ao servidor.',
    );
  });
});

describe('Perfil - habilidades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('lista as disciplinas que a pessoa ensina e mostra o vazio de quem quer aprender', async () => {
    await renderizar();

    const ensina = screen.getByRole('list', { name: 'Disciplinas que eu ensino' });
    expect(within(ensina).getByText('Cálculo I')).toBeInTheDocument();

    const aprende = screen.getByRole('list', { name: 'Disciplinas que eu quero aprender' });
    expect(within(aprende).getByText('Nenhuma disciplina cadastrada.')).toBeInTheDocument();
  });

  test('o seletor não oferece disciplinas que já estão naquele bloco', async () => {
    await renderizar();

    const ensina = screen.getByLabelText('Disciplina que eu ensino');
    expect(within(ensina).queryByRole('option', { name: 'Cálculo I' })).not.toBeInTheDocument();
    expect(within(ensina).getByRole('option', { name: 'Física' })).toBeInTheDocument();
    expect(within(ensina).getByRole('option', { name: 'Programação' })).toBeInTheDocument();

    const aprende = screen.getByLabelText('Disciplina que eu quero aprender');
    expect(within(aprende).getByRole('option', { name: 'Cálculo I' })).toBeInTheDocument();
  });

  test('adicionar fica desabilitado até escolher uma disciplina', async () => {
    await renderizar();

    expect(screen.getByRole('button', { name: 'Adicionar ao que eu ensino' })).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText('Disciplina que eu ensino'), '4');

    expect(screen.getByRole('button', { name: 'Adicionar ao que eu ensino' })).toBeEnabled();
  });

  test('adiciona uma disciplina que a pessoa ensina', async () => {
    const estado = await renderizar();

    await userEvent.selectOptions(screen.getByLabelText('Disciplina que eu ensino'), '4');
    estado.skills = {
      oferta: [
        { id_habilidade: 1, id_disciplina: 3, nome_disciplina: 'Cálculo I' },
        { id_habilidade: 2, id_disciplina: 4, nome_disciplina: 'Física' },
      ],
      demanda: [],
    };
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar ao que eu ensino' }));

    expect(api).toHaveBeenCalledWith('/skills/oferta', {
      method: 'POST',
      body: { id_disciplina: 4 },
    });
    const ensina = screen.getByRole('list', { name: 'Disciplinas que eu ensino' });
    expect(await within(ensina).findByText('Física')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Disciplina adicionada.');
  });

  test('adiciona uma disciplina que a pessoa quer aprender', async () => {
    const estado = await renderizar();

    await userEvent.selectOptions(screen.getByLabelText('Disciplina que eu quero aprender'), '5');
    estado.skills = {
      oferta: SKILLS.oferta,
      demanda: [{ id_habilidade: 9, id_disciplina: 5, nome_disciplina: 'Programação' }],
    };
    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar ao que eu quero aprender' }),
    );

    expect(api).toHaveBeenCalledWith('/skills/demanda', {
      method: 'POST',
      body: { id_disciplina: 5 },
    });
    const aprende = screen.getByRole('list', { name: 'Disciplinas que eu quero aprender' });
    expect(await within(aprende).findByText('Programação')).toBeInTheDocument();
  });

  test('erro ao adicionar mostra a mensagem do backend', async () => {
    await renderizar({
      escrita: () => Promise.reject(new Error('Habilidade já cadastrada.')),
    });

    await userEvent.selectOptions(screen.getByLabelText('Disciplina que eu ensino'), '4');
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar ao que eu ensino' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Habilidade já cadastrada.');
  });
});