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

module.exports = { cadastrarDemanda, cadastrarOferta, listarMinhasHabilidades };