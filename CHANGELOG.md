# Histórico de versões

## V2 — Laboratórios e estoque de computadores
- Reserva por laboratório: **Laboratório 1** e **Laboratório 2** (a "Sala de Computadores" da V1 virou Laboratório 1, sem perder reservas).
- Novo **estoque de computadores** por laboratório (carregados e descarregados), atualizado pelo professor, com registro de quem atualizou e quando.
- Tabelas de reservas passaram a mostrar a coluna Laboratório.
- Novas rotas: `GET /api/estoque` e `PUT /api/estoque/:sala_id`.
- Nova tabela `estoque` no banco.
- Documento de requisitos atualizado (RF10 a RF12, RN08, RN09, HU10 a HU12).

## V1 — Primeira versão
- Login por e-mail e senha, com administrador criado pelo `.env`.
- Tela do administrador (`admin.html`) para cadastrar e remover professores.
- Reserva da sala de computadores, com bloqueio de horário sobreposto e de datas passadas.
- Cancelamento das próprias reservas.
- Página inicial no estilo LabSchedule (`index.html`).
- Documento de requisitos e histórias de usuário.
