const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');  // Para criptografar senhas
const jwt = require('jsonwebtoken');  // Para geração de token JWT

const app = express();
const port = 3000;
const secretKey = 'seu-segredo-para-jwt'; // Chave secreta para gerar JWT

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

// Rota para listar todos os clientes
app.get('/clientes/dados', (req, res) => {
  const sql = 'SELECT * FROM clientes';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Rota para cadastrar um novo cliente com criptografia de senha
app.post('/clientes/dados', (req, res) => {
  const { nome, email, password } = req.body;

  // Criptografa a senha antes de salvar
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criptografar a senha' });
    }

    const sql = 'INSERT INTO clientes (nome, email, password) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, hash], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: result.insertId, nome, email });
      }
    });
  });
});
// Rota para buscar um cliente por ID// Rota para buscar um cliente por email
app.get('/clientes/email/:email', (req, res) => {
    const { email } = req.params;
    const sql = 'SELECT * FROM clientes WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'Cliente não encontrado' });
      } else {
        res.json(results[0]); // Retorna o primeiro cliente encontrado
      }
    });
  });
  
// Rota para buscar um cliente por ID
app.get('/clientes/id/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM clientes WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    } else {
      res.json(results[0]); // Retorna o primeiro cliente encontrado
    }
  });
});


// Rota para atualizar um cliente com criptografia de senha
app.put('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, password } = req.body;

  // Criptografa a nova senha antes de atualizar
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criptografar a senha' });
    }

    const sql = 'UPDATE clientes SET nome = ?, email = ?, password = ? WHERE id = ?';
    db.query(sql, [nome, email, hash, id], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id, nome, email });
      }
    });
  });
});

// Rota para eliminar um cliente
app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM clientes WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    } else {
      res.json({ message: 'Cliente eliminado com sucesso' });
    }
  });
});

// Rota para login com comparação de senha e geração de JWT
app.post('/clientes/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM clientes WHERE email = ?';

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const user = results[0];

    // Compara a senha inserida com a senha criptografada no banco de dados
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou senha incorretos.' });
      }

      // Gera o token JWT após login bem-sucedido
      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: '1h' // O token expira em 1 hora
      });

      // Retorna o token para o cliente
      res.json({ token });
    });
  });
});



// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
