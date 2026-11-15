import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { api } from '../services/api';
import Mentorias from './Mentorias';

vi.mock('../services/api');

const UM_DIA = 24 * 60 * 60 * 1000;

function confirmadaEm(data_hora) {
  return {
    id_mentoria: 1,
    status: 'CONFIRMADA',
    data_hora: data_hora.toISOString(),
    papel: 'TUTOR',
    outra_pessoa: { id_usuario: 12, nome: 'Ana' },
    disciplina: 'Cálculo I',
    link_videochamada: null,
  };
}

async function abrirConfirmadas(lista) {
  api.mockResolvedValue(lista);
  render(<Mentorias />);
  await userEvent.click(await screen.findByRole('tab', { name: 'Confirmadas (1)' }));
}

describe('Mentorias - concluir só depois da hora marcada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('antes da data, o tutor vê o botão Concluir desabilitado e o aviso', async () => {
    await abrirConfirmadas([confirmadaEm(new Date(Date.now() + UM_DIA))]);

    expect(screen.getByRole('button', { name: 'Concluir mentoria' })).toBeDisabled();
    expect(screen.getByText(/Disponível para concluir a partir de/)).toBeInTheDocument();
  });

  test('depois da data, o botão Concluir fica habilitado e sem aviso', async () => {
    await abrirConfirmadas([confirmadaEm(new Date(Date.now() - UM_DIA))]);

    expect(screen.getByRole('button', { name: 'Concluir mentoria' })).toBeEnabled();
    expect(screen.queryByText(/Disponível para concluir a partir de/)).not.toBeInTheDocument();
  });
});