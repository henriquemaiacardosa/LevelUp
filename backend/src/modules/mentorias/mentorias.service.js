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

module.exports = { solicitarMentoria };