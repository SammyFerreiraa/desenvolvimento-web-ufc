const Aluno = require('../models/Aluno');

class AlunoService {
    constructor() {
        this.alunos = [
            new Aluno(1, 'João Silva', 8.5, 'CC'),
            new Aluno(2, 'Maria Santos', 9.2, 'ES'),
            new Aluno(3, 'Pedro Oliveira', 7.8, 'SI'),
            new Aluno(4, 'Ana Costa', 8.9, 'CC'),
            new Aluno(5, 'Carlos Ferreira', 7.5, 'ES')
        ];
    }

    buscarTodos() {
        return this.alunos;
    }

    buscarPorId(id) {
        return this.alunos.find(aluno => aluno.id === parseInt(id));
    }

    buscarPorCurso(curso) {
        return this.alunos.filter(aluno => 
            aluno.curso.toLowerCase().includes(curso.toLowerCase())
        );
    }

    adicionar(dadosAluno) {
        const novoId = Math.max(...this.alunos.map(a => a.id)) + 1;
        const novoAluno = new Aluno(
            novoId, 
            dadosAluno.nome, 
            dadosAluno.ira, 
            dadosAluno.curso
        );
        
        novoAluno.validar();
        this.alunos.push(novoAluno);
        return novoAluno;
    }

    atualizar(id, dadosAluno) {
        const indice = this.alunos.findIndex(aluno => aluno.id === parseInt(id));
        if (indice === -1) {
            throw new Error('Aluno não encontrado');
        }

        const alunoAtualizado = new Aluno(
            parseInt(id),
            dadosAluno.nome,
            dadosAluno.ira,
            dadosAluno.curso
        );

        alunoAtualizado.validar();
        this.alunos[indice] = alunoAtualizado;
        return alunoAtualizado;
    }

    deletar(id) {
        const indice = this.alunos.findIndex(aluno => aluno.id === parseInt(id));
        if (indice === -1) {
            throw new Error('Aluno não encontrado');
        }

        const alunoRemovido = this.alunos.splice(indice, 1)[0];
        return alunoRemovido;
    }
}

module.exports = new AlunoService();
