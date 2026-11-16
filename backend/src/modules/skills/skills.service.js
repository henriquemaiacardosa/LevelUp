const skillsRepository = require('./skills.repository');

function erroHttp(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

async function cadastrar(id_usuario, id_disciplina, tipo_habilidade) {
  const id = Number(id_disciplina);

  if (!Number.isInteger(id) || id < 1) {
    throw erroHttp(400, 'Identificador da disciplina inválido.');
  }

  try {
    return await skillsRepository.criarHabilidade({
      id_usuario,
      id_disciplina: id,
      tipo_habilidade,
    });
  } catch (erro) {
    if (erro.code === 'P2002') {
      throw erroHttp(409, 'Você já cadastrou esta disciplina nesta lista.');
    }
    if (erro.code === 'P2003') {
      throw erroHttp(404, 'Disciplina não encontrada.');
    }
    throw erro;
  }
}

async function cadastrarDemanda(id_usuario, id_disciplina) {
  return cadastrar(id_usuario, id_disciplina, 'DEMANDA');
}

async function cadastrarOferta(id_usuario, id_disciplina) {
  return cadastrar(id_usuario, id_disciplina, 'OFERTA');
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