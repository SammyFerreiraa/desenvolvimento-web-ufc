class Aluno {
    constructor(id, nome, ira, curso) {
        this.id = id;
        this.nome = nome;
        this.ira = ira;
        this.curso = curso;
    }

    validar() {
        if (!this.nome || this.ira === undefined || this.ira === null || !this.curso) {
            throw new Error('Todos os campos são obrigatórios: nome, ira e curso');
        }
        
        if (this.ira < 0 || this.ira > 10) {
            throw new Error('IRA deve estar entre 0 e 10');
        }
        
        if (this.nome.trim().length < 2) {
            throw new Error('Nome deve ter pelo menos 2 caracteres');
        }
        
        if (this.curso.trim().length < 2) {
            throw new Error('Curso deve ter pelo menos 2 caracteres');
        }
        
        return true;
    }
}

module.exports = Aluno;
