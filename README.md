# TCC 2º B — Reserva da Sala de Computadores (V2)

## Como rodar
1. Instale o Node.js.
2. Cole o código do front-end (index.html, CSS, JS) na pasta `FRONT-END/`. A tela do administrador já está em `FRONT-END/admin.html` (acesse http://localhost:3000/admin.html). A página inicial (login e reservas, estilo LabSchedule) é `FRONT-END/index.html` (http://localhost:3000).
3. No terminal:
   ```
   cd BACK-END
   copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
   npm install
   npm start
   ```
4. Abra http://localhost:3000

O admin é criado automaticamente no primeiro início com o e-mail/senha do `.env`.

## Rotas da API
| Método | Rota | Quem usa |
|---|---|---|
| POST | /api/login | todos |
| GET | /api/salas | logado |
| GET | /api/reservas?data=AAAA-MM-DD | logado |
| GET | /api/reservas/minhas | logado |
| POST | /api/reservas | logado |
| DELETE | /api/reservas/:id | dono ou admin |
| GET | /api/estoque | logado |
| PUT | /api/estoque/:sala_id | logado (registra quem atualizou) |
| GET/POST | /api/usuarios | admin |
| DELETE | /api/usuarios/:id | admin |

Rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>` (o token vem do login).

## Pastas do projeto
- `DOCUMENTACAO/` — requisitos, diagramas e relatórios (Analista de Requisitos e Documentação/QA)
- `PROTOTIPO/` — links/arquivos do Figma/Canva/Penpot (UI/UX)
- `FRONT-END/` — HTML, CSS e JavaScript (Front-End)
- `BACK-END/` — API em Node.js (Back-End)
- `BANCO/` — modelo e script do banco de dados (Banco/Infra)
- `TESTES/` — tabela de testes e registro de erros (Documentação/QA)
