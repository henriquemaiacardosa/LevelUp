const mentoriasRepository = require('./mentorias.repository');

function erroHttp(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function solicitarMentoria({ id_aluno, id_tutor, id_disciplina, data_hora }) {
  if (id_aluno === id_tutor) {
    throw erroHttp(400, 'Não é possível agendar uma mentoria consigo mesmo.');
  }

  const data = new Date(data_hora);
  if (Number.isNaN(data.getTime())) {
    throw erroHttp(400, 'data_hora inválida.');
  }
  if (data <= new Date()) {
    throw erroHttp(400, 'data_hora não pode estar no passado.');
  }

  const oferece = await mentoriasRepository.tutorOfereceDisciplina(id_tutor, id_disciplina);
  if (!oferece) {
    throw erroHttp(400, 'O tutor não oferece esta disciplina.');
  }

  return mentoriasRepository.criarMentoria({
    id_aluno,
    id_tutor,
    id_disciplina,
    data_hora: data,
  });
}

const STATUS_PERMITIDOS = ['CONFIRMADA', 'CANCELADA'];

async function responderSolicitacao({ id_mentoria, id_usuario, status }) {
  if (!STATUS_PERMITIDOS.includes(status)) {
    throw erroHttp(400, 'status deve ser CONFIRMADA ou CANCELADA.');
  }

  const mentoria = await mentoriasRepository.buscarPorId(id_mentoria);
  if (!mentoria) {
    throw erroHttp(404, 'Mentoria não encontrada.');
  }
  if (mentoria.id_tutor !== id_usuario) {
    throw erroHttp(403, 'Apenas o tutor da mentoria pode responder à solicitação.');
  }
  if (mentoria.status !== 'PENDENTE') {
    throw erroHttp(409, 'Só é possível responder a mentorias pendentes.');
  }

  return mentoriasRepository.atualizarStatus(id_mentoria, status);
}

function linkValido(link) {
  if (typeof link !== 'string') return false;
  try {
    const url = new URL(link);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (erro) {
    return false;
  }
}

async function definirLink({ id_mentoria, id_usuario, link_videochamada }) {
  if (!linkValido(link_videochamada)) {
    throw erroHttp(400, 'link_videochamada deve ser uma URL http ou https válida.');
  }

  const mentoria = await mentoriasRepository.buscarPorId(id_mentoria);
  if (!mentoria) {
    throw erroHttp(404, 'Mentoria não encontrada.');
  }
  if (mentoria.id_tutor !== id_usuario) {
    throw erroHttp(403, 'Apenas o tutor da mentoria pode definir o link.');
  }
  if (mentoria.status !== 'CONFIRMADA') {
    throw erroHttp(409, 'O link só pode ser definido em mentorias confirmadas.');
  }

  return mentoriasRepository.atualizarLink(id_mentoria, link_videochamada);
}

const XP_TUTOR = 50;
const XP_ALUNO = 20;

async function concluirMentoria({ id_mentoria, id_usuario }) {
  const mentoria = await mentoriasRepository.buscarPorId(id_mentoria);
  if (!mentoria) {
    throw erroHttp(404, 'Mentoria não encontrada.');
  }
  if (mentoria.id_tutor !== id_usuario) {
    throw erroHttp(403, 'Apenas o tutor da mentoria pode concluí-la.');
  }
  if (mentoria.status !== 'CONFIRMADA') {
    throw erroHttp(409, 'Só é possível concluir mentorias confirmadas.');
  }
  if (new Date(mentoria.data_hora) > new Date()) {
    throw erroHttp(409, 'A mentoria ainda não aconteceu.');
  }

  return mentoriasRepository.concluirComXp({
    id_mentoria,
    id_tutor: mentoria.id_tutor,
    id_aluno: mentoria.id_aluno,
    xp_tutor: XP_TUTOR,
    xp_aluno: XP_ALUNO,
  });
}

module.exports = { solicitarMentoria, responderSolicitacao, definirLink, concluirMentoria };