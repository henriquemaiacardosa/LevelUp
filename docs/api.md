# API do LevelUp

Base: `/api` (local: `http://localhost:3000/api`). Corpo e resposta em JSON.
Total: **22 endpoints**.

## Convenções

- **Autenticação:** exceto cadastro e login, todas as rotas exigem `Authorization: Bearer <token>`
  (token devolvido pelo login). Sem token ou com token inválido/expirado a resposta é `401`.
- A identidade do usuário vem **sempre do token**; nenhum endpoint recebe `id_usuario` do cliente
  (exceto o `id_usuario` do tutor na consulta de detalhes).
- **Erros:** `{ "erro": "mensagem" }` com o status HTTP adequado. Falhas inesperadas
  respondem `500` com `Erro interno do servidor.` (o detalhe vai para o log do servidor).
- Datas em formato ISO 8601 (`2030-01-01T10:00:00Z`).

## Resumo

| Método | Rota                          | Descrição                                  |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/auth/cadastro`              | Cria uma conta                             |
| POST   | `/auth/login`                 | Autentica e devolve o token                |
| GET    | `/users/perfil`               | Dados do perfil                            |
| PUT    | `/users/perfil`               | Atualiza curso e semestre                  |
| GET    | `/users/xp`                   | XP e nível                                 |
| DELETE | `/users/perfil`               | Exclui a conta (anonimiza, LGPD)           |
| GET    | `/disciplinas`                | Lista as disciplinas                       |
| GET    | `/skills`                     | Minhas habilidades (ensino e aprendizado)  |
| POST   | `/skills/oferta`              | Passo a ensinar uma disciplina             |
| POST   | `/skills/demanda`             | Quero aprender uma disciplina              |
| DELETE | `/skills/:id_habilidade`      | Remove uma habilidade minha                |
| GET    | `/disponibilidade`            | Minha disponibilidade semanal              |
| PUT    | `/disponibilidade`            | Substitui minha disponibilidade            |
| GET    | `/matchmaking?id_disciplina=` | Tutores que ensinam a disciplina           |
| GET    | `/tutores/:id_usuario`        | Detalhes de um tutor                       |
| POST   | `/mentorias`                  | Solicita uma mentoria                      |
| GET    | `/mentorias?status=`          | Minhas mentorias (como aluno ou tutor)     |
| PATCH  | `/mentorias/:id/status`       | Tutor confirma ou recusa                   |
| PATCH  | `/mentorias/:id/link`         | Define o link da videochamada              |
| PATCH  | `/mentorias/:id/cancelar`     | Cancela uma mentoria confirmada            |
| PATCH  | `/mentorias/:id/concluir`     | Conclui e distribui XP                     |
| GET    | `/leaderboard`                | Ranking por XP                             |

## Autenticação

### POST `/auth/cadastro`

Corpo: `{ "nome": "Ana", "email": "ana@exemplo.com", "senha": "minimo8chars" }`

- `201`: usuário criado (sem a senha).
- `400`: campos ausentes (`Nome, e-mail e senha são obrigatórios.`), `E-mail inválido.` ou
  `A senha deve ter pelo menos 8 caracteres.`
- `409`: `E-mail já cadastrado`.

### POST `/auth/login`

Corpo: `{ "email": "ana@exemplo.com", "senha": "minimo8chars" }`

- `200`: `{ "token": "..." }`.
- `400`: e-mail ou senha ausentes.
- `401`: `Credenciais inválidas`.

## Usuário

### GET `/users/perfil`

`200`: `{ "id_usuario", "nome", "email", "curso", "semestre" }`. `404` se o usuário não existir.

### PUT `/users/perfil`

Corpo: `{ "curso": "Engenharia de Software", "semestre": 7 }`

- `200`: perfil atualizado.
- `400`: `Semestre deve ser um número inteiro positivo.`

### GET `/users/xp`

`200`: `{ "xp_ensino", "xp_aprendizado", "xp_total", "nivel" }`, em que
`nivel = floor(xp_total / 100) + 1`.

### DELETE `/users/perfil`

Exclusão de conta (LGPD). Na mesma transação: cancela as mentorias `PENDENTE`/`CONFIRMADA` da
pessoa, apaga suas habilidades e disponibilidade e **anonimiza** o cadastro (nome genérico,
e-mail inválido, senha inutilizável, curso/semestre/XP zerados). O histórico de mentorias
concluídas é mantido para o outro participante, e a pessoa sai do ranking e das buscas.

- `204`: sem corpo. A conta deixa de aceitar login.
- `404`: usuário não encontrado.

## Disciplinas e habilidades

### GET `/disciplinas`

`200`: lista de disciplinas (`id_disciplina`, `nome_disciplina`).

### GET `/skills`

`200`:

```json
{
  "oferta":  [{ "id_habilidade": 1, "id_disciplina": 3, "nome_disciplina": "Cálculo I" }],
  "demanda": []
}
```

### POST `/skills/oferta` e POST `/skills/demanda`

Corpo: `{ "id_disciplina": 3 }`

- `201`: habilidade criada.
- `400`: `id_disciplina é obrigatório.` ou `Identificador da disciplina inválido.`
- `404`: `Disciplina não encontrada.`
- `409`: `Você já cadastrou esta disciplina nesta lista.`

### DELETE `/skills/:id_habilidade`

Só remove habilidades do próprio usuário.

- `204`: removida.
- `400`: `Identificador da habilidade inválido.`
- `404`: `Habilidade não encontrada.`

## Disponibilidade

Valores: `dia_semana` ∈ `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA`, `SABADO`, `DOMINGO`;
`turno` ∈ `MANHA`, `TARDE`, `NOITE`.

### GET `/disponibilidade`

`200`: `{ "disponibilidade": [{ "dia_semana": "SEGUNDA", "turno": "NOITE" }] }`

### PUT `/disponibilidade`

Substitui toda a disponibilidade. Corpo:
`{ "disponibilidade": [{ "dia_semana": "SEGUNDA", "turno": "NOITE" }] }`

- `200`: disponibilidade salva (mesmo formato do GET).
- `400`: itens inválidos.

## Busca de tutores

### GET `/matchmaking?id_disciplina=3`

`200`: tutores que ensinam a disciplina. `400`: `id_disciplina deve ser um número inteiro positivo.`

### GET `/tutores/:id_usuario`

`200`: detalhes do tutor (perfil, disciplinas e disponibilidade). `404` se não for encontrado.

## Mentorias

Estados: `PENDENTE` → `CONFIRMADA` ou `CANCELADA` → `CONCLUIDA`.

### POST `/mentorias`

Corpo: `{ "id_tutor": 20, "id_disciplina": 3, "data_hora": "2030-01-01T10:00:00Z" }`

- `201`: mentoria criada com status `PENDENTE`.
- `400`: campos ausentes ou inválidos (`id_tutor` e `id_disciplina` precisam ser inteiros).
- Regras de negócio retornam `4xx` com a mensagem (por exemplo, tutor que não ensina a disciplina
  ou data no passado).

### GET `/mentorias?status=CONFIRMADA`

Lista as mentorias em que o usuário é aluno ou tutor, em ordem de data. O filtro `status` é opcional.
Cada item traz `id_mentoria`, `status`, `data_hora`, `link_videochamada`, `tutor`, `aluno` e
`disciplina`.

### PATCH `/mentorias/:id/status`

Corpo: `{ "status": "CONFIRMADA" }` ou `{ "status": "CANCELADA" }` (recusar).
Só o tutor, e só enquanto a mentoria está `PENDENTE`.

- `200`: mentoria atualizada.
- `400`: id inválido ou `status` ausente/inválido.
- `403`: quem responde não é o tutor.
- `404`: mentoria não encontrada.
- `409`: a mentoria não está pendente, ou
  `Não é possível confirmar uma mentoria cuja data já passou.` (recusar continua permitido).

### PATCH `/mentorias/:id/link`

Corpo: `{ "link_videochamada": "https://meet.exemplo.com/abc" }`. `200` com a mentoria atualizada;
`400` se o link faltar; `403`/`404` conforme a regra.

### PATCH `/mentorias/:id/cancelar`

Cancela uma mentoria `CONFIRMADA`. `200` com a mentoria atualizada; `409` se não estiver confirmada.

### PATCH `/mentorias/:id/concluir`

Conclui uma mentoria `CONFIRMADA` cuja data já chegou e, na mesma transação, credita
**+50 XP ao tutor** (`xp_ensino`) e **+20 XP ao aluno** (`xp_aprendizado`).
`200` com a mentoria concluída; `409` (`A mentoria não está mais confirmada.`) em caso de corrida
ou estado inválido.

## Ranking

### GET `/leaderboard`

`200`: ranking dos usuários com XP, do maior para o menor. Contas excluídas (XP zerado) não aparecem.