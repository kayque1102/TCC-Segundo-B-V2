// Usa o SQLite que já vem dentro do Node.js (node:sqlite).
// Assim não precisa instalar nada extra nem compilar no Windows.
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'reservas.db'));
db.exec('PRAGMA foreign_keys = ON');

// Cria as tabelas a partir do arquivo da pasta BANCO
const schema = fs.readFileSync(path.join(__dirname, '..', 'BANCO', 'schema.sql'), 'utf8');
db.exec(schema);

// Laboratórios (a sala antiga "Sala de Computadores" vira "Laboratório 1")
db.prepare("UPDATE salas SET nome = 'Laboratório 1' WHERE nome = 'Sala de Computadores'").run();
for (const nome of ['Laboratório 1', 'Laboratório 2']) {
  if (!db.prepare('SELECT id FROM salas WHERE nome = ?').get(nome)) {
    db.prepare('INSERT INTO salas (nome, capacidade) VALUES (?, ?)').run(nome, 30);
  }
}
// Garante uma linha de estoque para cada laboratório
db.exec('INSERT OR IGNORE INTO estoque (sala_id) SELECT id FROM salas');

// Primeiro usuário = admin (dados vêm do .env)
if (db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n === 0) {
  const nome = process.env.ADMIN_NOME || 'Administrador';
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (email && senha) {
    db.prepare('INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?,?,?,?)')
      .run(nome, email, bcrypt.hashSync(senha, 10), 'admin');
    console.log('Admin criado:', email);
  } else {
    console.warn('ATENÇÃO: defina ADMIN_EMAIL e ADMIN_SENHA no .env para criar o admin.');
  }
}

module.exports = db;
