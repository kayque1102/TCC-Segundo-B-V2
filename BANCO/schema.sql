-- Banco de dados: Reserva da Sala de Computadores (SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  tipo       TEXT NOT NULL CHECK (tipo IN ('admin','professor')),
  criado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS salas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT NOT NULL UNIQUE,
  capacidade INTEGER NOT NULL DEFAULT 30
);

CREATE TABLE IF NOT EXISTS reservas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  sala_id     INTEGER NOT NULL REFERENCES salas(id),
  data        TEXT NOT NULL,            -- AAAA-MM-DD
  hora_inicio TEXT NOT NULL,            -- HH:MM
  hora_fim    TEXT NOT NULL,            -- HH:MM
  turma       TEXT,
  observacao  TEXT,
  status      TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','cancelada')),
  criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reservas_busca ON reservas (sala_id, data, status);

-- Estoque de computadores de cada laboratório (quem atualizou e quando)
CREATE TABLE IF NOT EXISTS estoque (
  sala_id        INTEGER PRIMARY KEY REFERENCES salas(id) ON DELETE CASCADE,
  carregados     INTEGER NOT NULL DEFAULT 0 CHECK (carregados >= 0),
  descarregados  INTEGER NOT NULL DEFAULT 0 CHECK (descarregados >= 0),
  atualizado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  atualizado_em  TEXT
);
