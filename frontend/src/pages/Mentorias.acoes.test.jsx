import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../services/api';
import Mentorias from './Mentorias';

vi.mock('../services/api');

function mentoria(campos = {}) {
  return {
    id_mentoria: 1,
    status: 'PENDENTE',
    data_hora: '2026-12-01T14:00:00.000Z',
    papel: 'TUTOR',
    outra_pessoa: { id_usuario: 12, nome: 'Ana' },
    disciplina: 'Cálculo I',
    link_videochamada: null,
    ...campos,
  };
}

function configurarApi({ lista, patch = () => Promise.resolve({}) }) {
  const estado = { lista };
  api.mockImplementation((caminho, opcoes) => {
    if (opcoes && opcoes.method === 'PATCH') return patch(caminho, opcoes);
    return Promise.resolve(estado.lista);
  });
  return estado;
}

async function abrirAba(nome) {
  await userEvent.click(await screen.findByRole('tab', { name: nome }));
}

describe('Mentorias - ações do tutor em mentoria pendente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('tutor aceita: envia CONFIRMADA, recarrega a lista e avisa', async () => {
    const estado = configurarApi({ lista: [mentoria()] });
    render(<Mentorias />);

    estado.lista = [mentoria({ status: 'CONFIRMADA' })];
    await userEvent.click(await screen.findByRole('button', { name: 'Aceitar' }));

    expect(api).toHaveBeenCalledWith('/mentorias/1/status', {
      method: 'PATCH',
      body: { status: 'CONFIRMADA' },
    });
    expect(await screen.findByRole('tab', { name: 'Confirmadas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mentoria aceita.');
  });

  test('tutor recusa: envia CANCELADA e avisa', async () => {
    const estado = configurarApi({ lista: [mentoria()] });
    render(<Mentorias />);

    estado.lista = [mentoria({ status: 'CANCELADA' })];
    await userEvent.click(await screen.findByRole('button', { name: 'Recusar' }));

    expect(api).toHaveBeenCalledWith('/mentorias/1/status', {
      method: 'PATCH',
      body: { status: 'CANCELADA' },
    });
    expect(await screen.findByRole('tab', { name: 'Canceladas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mentoria recusada.');
  });

  test('aluno com mentoria pendente não vê aceitar nem recusar', async () => {
    configurarApi({
      lista: [mentoria({ papel: 'ALUNO', outra_pessoa: { id_usuario: 11, nome: 'Tutor Teste' } })],
    });
    render(<Mentorias />);

    expect(await screen.findByText('Aguardando resposta do tutor.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aceitar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Recusar' })).not.toBeInTheDocument();
  });

  test('erro da api ao aceitar mostra a mensagem do backend e mantém a lista', async () => {
    configurarApi({
      lista: [mentoria()],
      patch: () => Promise.reject(new Error('Mentoria não está pendente.')),
    });
    render(<Mentorias />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aceitar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Mentoria não está pendente.');
    expect(screen.getByText('Cálculo I')).toBeInTheDocument();
  });

  test('desabilita os botões enquanto a ação está em andamento', async () => {
    configurarApi({ lista: [mentoria()], patch: () => new Promise(() => {}) });
    render(<Mentorias />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aceitar' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Aceitar' })).toBeDisabled();
    });
    expect(screen.getByRole('button', { name: 'Recusar' })).toBeDisabled();
  });
});

describe('Mentorias - ações em mentoria confirmada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('tutor vê o campo do link já preenchido quando existe', async () => {
    configurarApi({
      lista: [mentoria({ status: 'CONFIRMADA', link_videochamada: 'https://meet.google.com/abc' })],
    });
    render(<Mentorias />);

    await abrirAba('Confirmadas (1)');

    expect(screen.getByLabelText('Link da videochamada')).toHaveValue('https://meet.google.com/abc');
  });

  test('tutor salva o link da videochamada', async () => {
    const estado = configurarApi({ lista: [mentoria({ status: 'CONFIRMADA' })] });
    render(<Mentorias />);

    await abrirAba('Confirmadas (1)');
    await userEvent.type(screen.getByLabelText('Link da videochamada'), 'https://meet.google.com/xyz');
    estado.lista = [mentoria({ status: 'CONFIRMADA', link_videochamada: 'https://meet.google.com/xyz' })];
    await userEvent.click(screen.getByRole('button', { name: 'Salvar link' }));

    expect(api).toHaveBeenCalledWith('/mentorias/1/link', {
      method: 'PATCH',
      body: { link_videochamada: 'https://meet.google.com/xyz' },
    });
    expect(await screen.findByText('Link salvo.')).toBeInTheDocument();
  });

  test('salvar link fica desabilitado com o campo vazio', async () => {
    configurarApi({ lista: [mentoria({ status: 'CONFIRMADA' })] });
    render(<Mentorias />);

    await abrirAba('Confirmadas (1)');

    expect(screen.getByRole('button', { name: 'Salvar link' })).toBeDisabled();
  });

  test('tutor conclui a mentoria', async () => {
    const estado = configurarApi({ lista: [mentoria({ status: 'CONFIRMADA' })] });
    render(<Mentorias />);

    await abrirAba('Confirmadas (1)');
    estado.lista = [mentoria({ status: 'CONCLUIDA' })];
    await userEvent.click(screen.getByRole('button', { name: 'Concluir mentoria' }));

    expect(api).toHaveBeenCalledWith('/mentorias/1/concluir', { method: 'PATCH' });
    expect(await screen.findByRole('tab', { name: 'Concluídas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mentoria concluída.');
  });

  test('tutor cancela a mentoria confirmada', async () => {
    const estado = configurarApi({ lista: [mentoria({ status: 'CONFIRMADA' })] });
    render(<Mentorias />);

    await abrirAba('Confirmadas (1)');
    estado.lista = [mentoria({ status: 'CANCELADA' })];
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar mentoria' }));

    expect(api).toHaveBeenCalledWith('/mentorias/1/cancelar', { method: 'PATCH' });
    expect(await screen.findByRole('tab', { name: 'Canceladas (1)' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mentoria cancelada.');
  });

  test('aluno também pode cancelar, mas não conclui nem edita o link', async () => {
    configurarApi({
      lista: [
        mentoria({
          status: 'CONFIRMADA',
          papel: 'ALUNO',
          outra_pessoa: { id_usuario: 11, nome: 'Tutor Teste' },
        }),
      ],
    });
    render(<Mentorias />);

    await abrirAba('Confirmadas (1)');

    expect(screen.getByRole('button', { name: 'Cancelar mentoria' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Concluir mentoria' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Link da videochamada')).not.toBeInTheDocument();
  });

  test('mentoria concluída ou cancelada não tem ações', async () => {
    configurarApi({
      lista: [
        mentoria({ id_mentoria: 4, status: 'CONCLUIDA' }),
        mentoria({ id_mentoria: 5, status: 'CANCELADA' }),
      ],
    });
    render(<Mentorias />);

    await abrirAba('Concluídas (1)');
    expect(screen.queryByRole('button', { name: /Cancelar|Concluir|Aceitar|Recusar/ })).not.toBeInTheDocument();

    await abrirAba('Canceladas (1)');
    expect(screen.queryByRole('button', { name: /Cancelar|Concluir|Aceitar|Recusar/ })).not.toBeInTheDocument();
  });
});