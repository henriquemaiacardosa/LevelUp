const repository = require('./disponibilidade.repository');

const DIAS = ['SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
const TURNOS = ['MANHA', 'TARDE', 'NOITE'];

function erro(status, mensagem) {
  const e = new Error(mensagem);
  e.status = status;
  return e;
}

async function listarMinhaDisponibilidade(id_usuario) {
  const registros = await repository.listarPorUsuario(id_usuario);

  return {
    disponibilidade: registros.map(({ dia_semana, turno }) => ({ dia_semana, turno })),
  };
}

async function salvarMinhaDisponibilidade(id_usuario, disponibilidade) {
  if (!Array.isArray(disponibilidade)) {
    throw erro(400, 'Informe a lista de disponibilidade.');
  }

  const vistos = new Set();
  const itens = [];

  for (const item of disponibilidade) {
    const dia_semana = item?.dia_semana;
    const turno = item?.turno;

    if (!DIAS.includes(dia_semana)) throw erro(400, 'Dia da semana inválido.');
    if (!TURNOS.includes(turno)) throw erro(400, 'Turno inválido.');

    const chave = `${dia_semana}:${turno}`;
    if (vistos.has(chave)) continue;

    vistos.add(chave);
    itens.push({ dia_semana, turno });
  }

  await repository.substituirPorUsuario(id_usuario, itens);

  return { disponibilidade: itens };
}

module.exports = { listarMinhaDisponibilidade, salvarMinhaDisponibilidade };