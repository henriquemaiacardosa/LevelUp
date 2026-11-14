const skillsRepository = require('./skills.repository');

async function cadastrarDemanda(id_usuario, id_disciplina) {
  return skillsRepository.criarHabilidade({
    id_usuario,
    id_disciplina,
    tipo_habilidade: 'DEMANDA',
  });
}

async function cadastrarOferta(id_usuario, id_disciplina) {
  return skillsRepository.criarHabilidade({
    id_usuario,
    id_disciplina,
    tipo_habilidade: 'OFERTA',
  });
}

async function listarMinhasHabilidades(id_usuario) {
  const habilidades = await skillsRepository.listarPorUsuario(id_usuario);
  const resultado = { oferta: [], demanda: [] };

  for (const h of habilidades) {
    const item = {
      id_habilidade: h.id_habilidade,
      id_disciplina: h.disciplina.id_disciplina,
      nome_disciplina: h.disciplina.nome_disciplina,
    };

    if (h.tipo_habilidade === 'OFERTA') {
      resultado.oferta.push(item);
    } else {
      resultado.demanda.push(item);
    }
  }

  return resultado;
}

async function removerHabilidade(id_usuario, id_habilidade) {
  const id = Number(id_habilidade);

  if (!Number.isInteger(id) || id < 1) {
    const erro = new Error('Identificador da habilidade inválido.');
    erro.status = 400;
    throw erro;
  }

  const { count } = await skillsRepository.removerDoUsuario(id_usuario, id);

  if (count === 0) {
    const erro = new Error('Habilidade não encontrada.');
    erro.status = 404;
    throw erro;
  }
}

module.exports = { cadastrarDemanda, cadastrarOferta, listarMinhasHabilidades, removerHabilidade   };