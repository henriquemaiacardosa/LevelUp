import { obterToken } from './tokenStorage';

const URL_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function api(caminho, { method = 'GET', body } = {}) {
  const headers = {};

  const token = obterToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.');
  }

  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null;
  }

  if (!resposta.ok) {
    throw new ApiError(resposta.status, corpo?.erro ?? 'Erro inesperado. Tente novamente.');
  }

  return corpo;
}