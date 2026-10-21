require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-desenvolvimento';
if (!process.env.JWT_SECRET) console.warn('ATENÇÃO: defina JWT_SECRET no .env');

app.use(cors());
app.use(express.json());

// ---------- Helpers ----------
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

function soAdmin(req, res, next) {
  if (req.user.tipo !== 'admin') return res.status(403).json({ erro: 'Apenas o administrador pode fazer isso.' });
  next();
}

// ---------- Login ----------
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ erro: 'Informe e-mail e senha.' });

  const u = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(String(email).toLowerCase().trim());
  if (!u || !bcrypt.compareSync(senha, u.senha_hash)) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }
  const usuario = { id: u.id, nome: u.nome, email: u.email, tipo: u.tipo };
  const token = jwt.sign(usuario, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario });
});

// ---------- Salas ----------
app.get('/api/salas', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM salas').all());
});

// ---------- Reservas ----------
// Lista reservas ativas (opcional: ?data=AAAA-MM-DD)
app.get('/api/reservas', auth, (req, res) => {
  const { data } = req.query;
  let sql = `SELECT r.*, u.nome AS professor, s.nome AS sala
             FROM reservas r
             JOIN usuarios u ON u.id = r.usuario_id
             JOIN salas s ON s.id = r.sala_id
             WHERE r.status = 'ativa'`;
  const params = [];
  if (data) {
    if (!RE_DATA.test(data)) return res.status(400).json({ erro: 'Data inválida (use AAAA-MM-DD).' });
    sql += ' AND r.data = ?';
    params.push(data);
  }
  sql += ' ORDER BY r.data, r.hora_inicio';
  res.json(db.prepare(sql).all(...params));
});

// Reservas do professor logado
app.get('/api/reservas/minhas', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, s.nome AS sala FROM reservas r
    JOIN salas s ON s.id = r.sala_id
    WHERE r.usuario_id = ? AND r.status = 'ativa'
    ORDER BY r.data, r.hora_inicio`).all(req.user.id);
  res.json(rows);
});

// Cria reserva
app.post('/api/reservas', auth, (req, res) => {
  const { sala_id, data, hora_inicio, hora_fim, turma, observacao } = req.body || {};

  if (!sala_id || !data || !hora_inicio || !hora_fim)
    return res.status(400).json({ erro: 'Preencha sala, data, hora de início e hora de fim.' });
  if (!RE_DATA.test(data) || !RE_HORA.test(hora_inicio) || !RE_HORA.test(hora_fim))
    return res.status(400).json({ erro: 'Data ou horário em formato inválido.' });
  if (hora_fim <= hora_inicio)
    return res.status(400).json({ erro: 'A hora de fim deve ser depois da hora de início.' });

  const hoje = new Date().toISOString().slice(0, 10);
  if (data < hoje) return res.status(400).json({ erro: 'Não é possível reservar uma data que já passou.' });

  if (!db.prepare('SELECT id FROM salas WHERE id = ?').get(sala_id))
    return res.status(404).json({ erro: 'Sala não encontrada.' });

  // Regra de negócio: não pode haver horários sobrepostos na mesma sala e dia
  const conflito = db.prepare(`
    SELECT r.hora_inicio, r.hora_fim, u.nome AS professor
    FROM reservas r JOIN usuarios u ON u.id = r.usuario_id
    WHERE r.sala_id = ? AND r.data = ? AND r.status = 'ativa'
      AND r.hora_inicio < ? AND r.hora_fim > ?`).get(sala_id, data, hora_fim, hora_inicio);
  if (conflito) {
    return res.status(409).json({
      erro: `Horário indisponível: já reservado por ${conflito.professor} (${conflito.hora_inicio}–${conflito.hora_fim}).`
    });
  }

  const info = db.prepare(`INSERT INTO reservas
    (usuario_id, sala_id, data, hora_inicio, hora_fim, turma, observacao)
    VALUES (?,?,?,?,?,?,?)`)
    .run(req.user.id, sala_id, data, hora_inicio, hora_fim, turma || null, observacao || null);
  res.status(201).json({ id: info.lastInsertRowid, mensagem: 'Reserva criada com sucesso!' });
});

// Cancela reserva (dono ou admin)
app.delete('/api/reservas/:id', auth, (req, res) => {
  const r = db.prepare('SELECT * FROM reservas WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ erro: 'Reserva não encontrada.' });
  if (r.usuario_id !== req.user.id && req.user.tipo !== 'admin')
    return res.status(403).json({ erro: 'Você só pode cancelar as suas próprias reservas.' });
  db.prepare("UPDATE reservas SET status = 'cancelada' WHERE id = ?").run(r.id);
  res.json({ mensagem: 'Reserva cancelada.' });
});

// ---------- Estoque de computadores ----------
app.get('/api/estoque', auth, (req, res) => {
  res.json(db.prepare(`
    SELECT s.id AS sala_id, s.nome, s.capacidade,
           COALESCE(e.carregados, 0) AS carregados,
           COALESCE(e.descarregados, 0) AS descarregados,
           e.atualizado_em, u.nome AS atualizado_por
    FROM salas s
    LEFT JOIN estoque e ON e.sala_id = s.id
    LEFT JOIN usuarios u ON u.id = e.atualizado_por
    ORDER BY s.nome`).all());
});

// Qualquer professor logado pode atualizar; o sistema guarda quem fez
app.put('/api/estoque/:sala_id', auth, (req, res) => {
  const sala = db.prepare('SELECT * FROM salas WHERE id = ?').get(req.params.sala_id);
  if (!sala) return res.status(404).json({ erro: 'Laboratório não encontrado.' });

  const carregados = Number((req.body || {}).carregados);
  const descarregados = Number((req.body || {}).descarregados);
  if (!Number.isInteger(carregados) || !Number.isInteger(descarregados) || carregados < 0 || descarregados < 0)
    return res.status(400).json({ erro: 'Informe números inteiros (0 ou mais).' });
  if (carregados + descarregados > sala.capacidade)
    return res.status(400).json({ erro: `O total (${carregados + descarregados}) passa da capacidade do laboratório (${sala.capacidade}).` });

  db.prepare(`INSERT INTO estoque (sala_id, carregados, descarregados, atualizado_por, atualizado_em)
              VALUES (?, ?, ?, ?, datetime('now'))
              ON CONFLICT(sala_id) DO UPDATE SET
                carregados = excluded.carregados,
                descarregados = excluded.descarregados,
                atualizado_por = excluded.atualizado_por,
                atualizado_em = excluded.atualizado_em`)
    .run(sala.id, carregados, descarregados, req.user.id);
  res.json({ mensagem: 'Estoque atualizado!' });
});

// ---------- Usuários (admin) ----------
app.get('/api/usuarios', auth, soAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, nome, email, tipo, criado_em FROM usuarios ORDER BY nome').all());
});

app.post('/api/usuarios', auth, soAdmin, (req, res) => {
  const { nome, email, senha, tipo } = req.body || {};
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Informe nome, e-mail e senha.' });
  if (senha.length < 6) return res.status(400).json({ erro: 'A senha deve ter ao menos 6 caracteres.' });

  const mail = String(email).toLowerCase().trim();
  const dominio = (process.env.DOMINIO_EMAIL || '').toLowerCase();
  if (dominio && !mail.endsWith('@' + dominio))
    return res.status(400).json({ erro: `Use o e-mail institucional (@${dominio}).` });
  if (db.prepare('SELECT id FROM usuarios WHERE email = ?').get(mail))
    return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });

  const info = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?,?,?,?)')
    .run(nome, mail, bcrypt.hashSync(senha, 10), tipo === 'admin' ? 'admin' : 'professor');
  res.status(201).json({ id: info.lastInsertRowid, mensagem: 'Usuário cadastrado.' });
});

app.delete('/api/usuarios/:id', auth, soAdmin, (req, res) => {
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ erro: 'Você não pode excluir a si mesmo.' });
  const info = db.prepare('DELETE FROM usuarios WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json({ mensagem: 'Usuário removido.' });
});

// ---------- Front-end (mesma origem) ----------
app.use(express.static(path.join(__dirname, '..', 'FRONT-END')));

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
