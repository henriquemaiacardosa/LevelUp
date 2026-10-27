const CHAVE_TOKEN = 'levelup_token';

export function salvarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}