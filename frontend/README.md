# LevelUp, frontend

Aplicação React do LevelUp (mentoria acadêmica P2P com XP). Veja o
[README principal](../README.md) para a visão geral do projeto.

## Stack

React 19, Vite 8, React Router 7, CSS puro. Testes com Vitest e Testing Library.

## Configuração

```bash
npm install
cp .env.example .env    # no PowerShell: Copy-Item .env.example .env
```

| Variável       | Descrição                | Padrão                      |
| -------------- | ------------------------ | --------------------------- |
| `VITE_API_URL` | URL base da API (`/api`) | `http://localhost:3000/api` |

## Scripts

| Comando             | O que faz                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento (porta 5173)   |
| `npm run build`     | Build de produção em `dist/`               |
| `npm run lint`      | ESLint                                     |
| `npx vitest run`    | Executa os testes                          |
| `npm run coverage`  | Testes com relatório de cobertura          |

## Estrutura

```
src/
  auth/       AuthContext e controle de sessão (token no localStorage)
  layout/     Cabeçalho, navegação e estrutura das páginas autenticadas
  pages/      Telas: Autenticação, Início, Busca, Tutor, Mentorias, Ranking, Perfil
  routes/     RotaProtegida (redireciona ao login sem sessão)
  services/   api.js (cliente HTTP) e tokenStorage.js
```

## Como o front fala com a API

Toda chamada passa por `api(caminho, { method, body })` em `src/services/api.js`: ele monta a URL,
envia o `Authorization: Bearer <token>`, converte erros em `ApiError` (com `status` e a mensagem do
backend) e, em caso de **401 com sessão ativa**, limpa o token e volta para o login.

## Testes

Cada página tem seu arquivo `.test.jsx`, e o cliente HTTP e a sessão têm testes próprios. A API é
simulada com `vi.mock('../services/api')`.