const express = require('express');
require('dotenv').config();
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Segredo do JWT (coloque no .env depois)
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura';

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao autenticar' });
    console.error('Erro interno:', error); // 👈 isso mostra o erro no terminal
    res.status(500).json({ erro: 'Erro ao autenticar' })
  }
});

module.exports = router;