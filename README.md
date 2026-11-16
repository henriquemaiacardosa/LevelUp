# LevelUp

Plataforma web de **mentoria acadêmica entre colegas (P2P)** com gamificação por XP.
Projeto de portfólio (TCC, PAC VII) do curso de Engenharia de Software da Católica SC.

Quem domina uma disciplina se oferece como tutor; quem tem dificuldade encontra um tutor,
agenda uma mentoria e, a cada encontro concluído, os dois ganham XP e sobem no ranking.

A proposta completa (problema, requisitos RF/RNF e cronograma) está na RFC, em [`docs/`](docs/).

## Funcionalidades

- Cadastro e login com JWT.
- Perfil (curso e semestre), disciplinas que a pessoa **ensina** e que quer **aprender**, e quadro de
  disponibilidade semanal (dia × turno).
- Busca de tutores por disciplina (matchmaking) e página de detalhes do tutor.
- Mentorias com ciclo de vida: solicitar, confirmar ou recusar, definir link de videochamada,
  cancelar e concluir.
- XP e níveis: ao concluir uma mentoria, o tutor ganha **+50 XP** e o aluno **+20 XP**;
  cada nível tem 100 XP. Há um ranking geral.
- **LGPD:** a pessoa pode excluir a própria conta; os dados pessoais são anonimizados.

### Regras de negócio principais

- Estados da mentoria: `PENDENTE` → `CONFIRMADA` ou `CANCELADA` → `CONCLUIDA`.
- Só o tutor responde a uma solicitação, e só enquanto ela está `PENDENTE`.
- Não é possível confirmar uma mentoria cuja data já passou, nem concluir antes da data marcada.
- A identidade vem sempre do token JWT, nunca do corpo da requisição.

## Tecnologias

| Camada    | Stack                                                                 |
| --------- | --------------------------------------------------------------------- |
| Backend   | Node.js, Express 5, Prisma 6, MySQL, JWT, bcrypt                      |
| Frontend  | React 19, Vite 8, React Router 7, CSS puro                            |
| Testes    | Jest + Supertest (backend), Vitest + Testing Library (frontend)       |
| Qualidade | GitHub Actions (CI) e SonarQube Cloud (Quality Gate em cada PR)       |
| Infra     | AWS: Amplify (front), EC2 com Docker Compose + Caddy (API), RDS MySQL |

## Arquitetura

```
Navegador ──► Frontend (React, Amplify)
                  │  HTTPS  (VITE_API_URL)
                  ▼
              Caddy (HTTPS automático) ──► API Express (Docker) ──► MySQL (RDS)
```

O backend segue camadas: **Route → Controller → Service → Repository → Prisma**.
As regras de negócio ficam no *service*; o *repository* é o único que fala com o banco.

## Estrutura do repositório

```
backend/     API (src/modules/<modulo>/, src/routes, src/middlewares, prisma/)
frontend/    Aplicação React (src/pages, src/auth, src/layout, src/services)
deploy/      docker-compose.yml, Caddyfile e .env.example do servidor
docs/        RFC do projeto e documentação da API (docs/api.md)
.github/     Workflow de CI (testes, lint, build e análise do Sonar)
```

## Como rodar localmente

Pré-requisitos: **Node.js 20+** e um **MySQL** acessível.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # no PowerShell: Copy-Item .env.example .env
# edite o .env com os dados do seu banco e um JWT_SECRET próprio
npm run prisma:generate
npm run prisma:deploy       # aplica as migrações
npx prisma db seed          # popula as disciplinas
npm run dev                 # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:3000/api
npm run dev                 # http://localhost:5173
```

## Testes e qualidade

```bash
# backend (Jest, com cobertura)
cd backend && npm test

# frontend (Vitest, lint e cobertura)
cd frontend && npx vitest run
cd frontend && npm run lint
cd frontend && npm run coverage
```

O desenvolvimento segue **TDD** (teste falhando antes do código). O CI roda os testes do backend
(contra um MySQL de serviço), o lint, a cobertura e o build do frontend, e envia tudo ao SonarQube Cloud.
Cada Pull Request precisa passar no Quality Gate.

## Fluxo de trabalho

- Uma branch por funcionalidade, com commits pequenos e Pull Request para `dev`.
- `main` recebe o código estável para a entrega e é protegida.

## Deploy

- **Frontend:** AWS Amplify, publicado automaticamente a cada merge na branch configurada.
- **Backend:** EC2 com Docker Compose (API + Caddy para HTTPS) e RDS MySQL. Instruções e modelo de
  variáveis em [`deploy/`](deploy/); o arquivo `deploy/.env` real **nunca** vai para o Git.

## Segurança

- Segredos (`.env`, senha do banco, `JWT_SECRET`) ficam fora do repositório; use os `.env.example`.
- Senhas guardadas com hash (bcrypt); mínimo de 8 caracteres.
- CORS restrito às origens listadas em `CORS_ORIGIN`.

## Documentação da API

Todos os endpoints, corpos e respostas estão em [`docs/api.md`](docs/api.md).

## Autor

Henrique Maia Cardosa, Engenharia de Software, Católica SC.

## Deploy automático

A cada merge na `main`, o GitHub Actions executa o workflow **CI** (testes, lint, build e análise do Sonar). Se tudo passar, o workflow **Deploy** (`.github/workflows/deploy.yml`) pede à instância EC2 que atualize a API pelo AWS Systems Manager (SSM Run Command): `git pull` da `main` e `docker compose up -d --build`. Não há deploy manual por SSH ou FTP, e a porta 22 do servidor fica fechada. O front-end é publicado pelo AWS Amplify, também a partir do GitHub.

Secrets necessários no repositório: `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`, de um usuário IAM exclusivo do deploy, com permissão apenas para enviar comandos SSM à instância da API.
## Documenta��o

A documenta��o completa (arquitetura, API, instala��o, deploy, monitoramento, seguran�a e decis�es) est� na [Wiki do projeto](https://github.com/henriquemaiacardosa/LevelUp/wiki).

