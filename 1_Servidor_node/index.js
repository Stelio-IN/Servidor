const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuração do middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'testdb'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL');
  }
});

// Rota para listar todos os dados
app.get('/api/dados', (req, res) => {
  const sql = 'SELECT * FROM dados';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Rota para cadastrar um novo dado
app.post('/api/dados', (req, res) => {
  const { nome, valor } = req.body;
  const sql = 'INSERT INTO dados (nome, valor) VALUES (?, ?)';
  db.query(sql, [nome, valor], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: result.insertId, nome, valor });
    }
  });
});

// Rota para atualizar um dado existente
app.put('/api/dados/:id', (req, res) => {
  const { id } = req.params;
  const { nome, valor } = req.body;
  const sql = 'UPDATE dados SET nome = ?, valor = ? WHERE id = ?';
  db.query(sql, [nome, valor, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id, nome, valor });
    }
  });
});
// Rota para eliminar um dado
app.delete('/api/dados/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM dados WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Dado não encontrado' });
      } else {
        res.json({ message: 'Dado eliminado com sucesso' });
      }
    });
  });
  

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
