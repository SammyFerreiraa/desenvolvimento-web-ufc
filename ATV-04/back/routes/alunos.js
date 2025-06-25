const express = require('express');
const router = express.Router();
const alunoService = require('../services/alunoService');

router.get('/', (req, res) => {
    try {
        const { curso } = req.query;
        
        let alunos;
        if (curso) {
            alunos = alunoService.buscarPorCurso(curso);
        } else {
            alunos = alunoService.buscarTodos();
        }
        
        res.status(200).json({
            success: true,
            data: alunos,
            message: 'Alunos encontrados com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const aluno = alunoService.buscarPorId(id);
        
        if (!aluno) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: aluno,
            message: 'Aluno encontrado com sucesso'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

router.post('/', (req, res) => {
    try {
        const novoAluno = alunoService.adicionar(req.body);
        
        res.status(201).json({
            success: true,
            data: novoAluno,
            message: 'Aluno criado com sucesso'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erro ao criar aluno',
            error: error.message
        });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const alunoAtualizado = alunoService.atualizar(id, req.body);
        
        res.status(200).json({
            success: true,
            data: alunoAtualizado,
            message: 'Aluno atualizado com sucesso'
        });
    } catch (error) {
        const status = error.message === 'Aluno não encontrado' ? 404 : 400;
        res.status(status).json({
            success: false,
            message: 'Erro ao atualizar aluno',
            error: error.message
        });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const alunoRemovido = alunoService.deletar(id);
        
        res.status(200).json({
            success: true,
            data: alunoRemovido,
            message: 'Aluno removido com sucesso'
        });
    } catch (error) {
        const status = error.message === 'Aluno não encontrado' ? 404 : 500;
        res.status(status).json({
            success: false,
            message: 'Erro ao remover aluno',
            error: error.message
        });
    }
});

module.exports = router;
