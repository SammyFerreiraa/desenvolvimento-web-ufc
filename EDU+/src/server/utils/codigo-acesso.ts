/**
 * Gera código de acesso único para alunos
 * Formato: 2 letras + 4 números (ex: AB1234)
 */
export function gerarCodigoAcesso(): string {
   const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   const numeros = "0123456789";

   let codigo = "";

   // 2 letras aleatórias
   for (let i = 0; i < 2; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
   }

   // 4 números aleatórios
   for (let i = 0; i < 4; i++) {
      codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
   }

   return codigo;
}

/**
 * Verifica se o código está no formato correto
 */
export function validarFormatoCodigoAcesso(codigo: string): boolean {
   const regex = /^[A-Z]{2}[0-9]{4}$/;
   return regex.test(codigo);
}
