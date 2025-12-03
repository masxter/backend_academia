const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
require('dotenv').config();

async function criarAdmin() {
  const senhaCriptografada = await bcrypt.hash('karol@yneAdmin1909', 10);

  try {
    const admin = await prisma.user.create({
      data: {
        nome: 'Administrador',
        email: 'admin@academia.com',
        senha: senhaCriptografada
      }
    });
    console.log('Usuário administrador criado:', admin);
  } catch (error) {
    console.error('Erro ao criar administrador:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

criarAdmin();