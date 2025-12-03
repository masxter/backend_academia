const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const autenticarToken = require('../middlewares/authMiddleware');


// Cadastrar aluno com dados físicos
router.post('/', autenticarToken, async (req, res) => {
  if (req.usuario.email !== 'admin@academia.com') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
  }

  const {
    nome,
    telefone,
    peso,
    altura,
    bracoEsquerdo,
    bracoDireito,
    cochaEsquerda,
    cochaDireita,
    abdomen,
    panturrilhaEsquerda,
    panturrilhaDireita,
    cintura,
    quadril,
    busto,
    gorduraCorporal,
    gorduraVisceral,
    musculatura,
    indiceMassa,
    idadeCorporal,
    kcal,
    ativo
  } = req.body;

  try {
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        telefone,
        peso,
        altura,
        bracoEsquerdo,
        bracoDireito,
        cochaEsquerda,
        cochaDireita,
        abdomen,
        panturrilhaEsquerda,
        panturrilhaDireita,
        cintura,
        quadril,
        busto,
        gorduraCorporal,
        gorduraVisceral,
        musculatura,
        indiceMassa,
        idadeCorporal,
        kcal,
        ativo
      }
    });
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Atualizar aluno (apenas admin)
router.put('/:id', autenticarToken, async (req, res) => {
  if (req.usuario.email !== 'admin@academia.com') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
  }

  const { id } = req.params;
  const {
    nome,
    telefone,
    peso,
    altura,
    bracoEsquerdo,
    bracoDireito,
    cochaEsquerda,
    cochaDireita,
    abdomen,
    panturrilhaEsquerda,
    panturrilhaDireita,
    cintura,
    busto,
    gorduraCorporal,
    gorduraVisceral,
    musculatura,
    indiceMassa,
    idadeCorporal,
    kcal,
    ativo
  } = req.body;

  try {
    const alunoAtualizado = await prisma.aluno.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        telefone,
        peso,
        altura,
        bracoEsquerdo,
        bracoDireito,
        cochaEsquerda,
        cochaDireita,
        abdomen,
        panturrilhaEsquerda,
        panturrilhaDireita,
        cintura,
        busto,
        gorduraCorporal,
        gorduraVisceral,
        musculatura,
        indiceMassa,
        idadeCorporal,
        kcal,
        ativo
      }
    });
    res.json(alunoAtualizado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});



// adicionar evolução fisica do aluno

router.post('/:id/adicionarEvolucao', async (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  try {
    const evolucao = await prisma.evolucaoFisica.create({
      data: {
        alunoId: parseInt(id),
        ...dados
      }
    });
    res.json(evolucao);
  } catch (err) {
    res.status(400).json({ erro: 'Erro ao registrar evolução' });
  }
});


// buscar a evolucao do aluno
router.get('/:id/evolucao', async (req, res) => {
  const { id } = req.params;

  try {
    const historico = await prisma.evolucaoFisica.findMany({
      where: { alunoId: parseInt(id) },
      orderBy: { data: 'desc' }
    });
    res.json(historico);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
});

// POST /pagamentos
router.post('/pagamentos', async (req, res) => {
  try {
    const { valor, dataPagamento, usuarioId } = req.body;

    const pagamento = await prisma.pagamento.create({
      data: {
        valor: parseFloat(valor),
        dataPagamento: new Date(dataPagamento),
        usuarioId,
      },
    });

    res.json(pagamento);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});


// GET /alunos/:id/pagamentos
router.get('/:id/pagamentos', async (req, res) => {
  const { id } = req.params;

  const pagamentos = await prisma.pagamento.findMany({
    where: { usuarioId: parseInt(id) },
    orderBy: { dataPagamento: 'desc' },
  });

  res.json(pagamentos);
});



router.get('/listapagamentos', async (req, res) => {
  try {
    // Busca todos os pagamentos.
    const pagamentos = await prisma.pagamento.findMany({
      select: {
        id: true,
        valor: true,
        dataPagamento: true,
        // ✅ CORREÇÃO: O relacionamento 'aluno' deve estar DENTRO do 'select'
        aluno: { 
          select: {
            nome: true,
          }
        },
      },
      orderBy: {
        dataPagamento: 'desc',
      },
    });

    // Retorna a lista de pagamentos com status 200 (OK)
    res.status(200).json(pagamentos);

  } catch (error) {
    // ⚠️ Importante: Loga o erro real no console do servidor para depuração
    console.error('ERRO AO BUSCAR LISTA DE PAGAMENTOS:', error); 
    
    // Retorna 500 (Internal Server Error) para o cliente
    res.status(500).json({ 
      erro: 'Erro interno do servidor ao buscar pagamentos.', 
      detalhe: error.message 
    });
  }
});



router.get('/resumo-receita', async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const mesInt = parseInt(mes);
    const anoInt = parseInt(ano);

    // --- 🚨 VALIDAÇÃO DE ENTRADA ---
    if (isNaN(mesInt) || isNaN(anoInt) || mesInt < 1 || mesInt > 12 || anoInt < 2000) {
      return res.status(400).json({ 
        erro: 'Parâmetros inválidos.', 
        mensagem: 'Forneça um "mes" (1-12) e um "ano" (ex: 2025) válidos como query params.' 
      });
    }
    // -----------------------------

    // Define início e fim do mês
    const inicio = new Date(anoInt, mesInt - 1, 1); 
    const fim = new Date(anoInt, mesInt, 0, 23, 59, 59, 999); 

    // --- 🎯 OTIMIZAÇÃO PARA DASHBOARD ---
    // 1. Usando Prisma aggregation para somar o total diretamente no banco de dados.
    const resultadoAgregado = await prisma.pagamento.aggregate({
      _sum: {
        valor: true, // Soma o campo 'valor'
      },
      _count: {
        id: true, // Conta o número total de pagamentos
      },
      where: {
        dataPagamento: {
          gte: inicio,
          lte: fim,
        },
      },
    });

    const totalReceita = resultadoAgregado._sum.valor || 0; // Se for null, define como 0
    const totalTransacoes = resultadoAgregado._count.id;
    // ------------------------------------

    // 2. Retorno otimizado apenas com o resumo
    res.json({
      mes: mesInt,
      ano: anoInt,
      dashboard: 'Receitas (Entrada de Dinheiro)',
      totalRecebido: totalReceita,
      totalTransacoes: totalTransacoes,
      periodo: `${mesInt}/${anoInt}`,
    });
  } catch (error) {
    console.error('ERRO NO RESUMO DE RECEITA:', error); 
    res.status(500).json({ 
      erro: 'Erro interno ao calcular a receita.', 
      detalhe: error.message 
    });
  }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(id) }
    });

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
});

module.exports = router;