const express = require('express');
const cors = require('cors');
const alunoRoutes = require('./routes/alunoRoutes');
const authRoutes = require('./routes/authRoutes');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/alunos', alunoRoutes);
app.use('/auth', authRoutes);


module.exports = app;