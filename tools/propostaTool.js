const { sendEmail } = require('../services/emailService');

const tools = [
  {
    type: 'function',
    function: {
      name: 'finalizar_proposta',
      description: 'Chame quando todas as informações obrigatórias forem coletadas: nomeEmpresa, cnpj, valor, tipo.',
      parameters: {
        type: 'object',
        properties: {
          nomeEmpresa: { type: 'string' },
          cnpj: { type: 'string' },
          valor: { type: 'number' },
          tipo: { type: 'string', enum: ['duplicata', 'cheque', 'contrato'] },
          contato: { type: 'string' },
        },
        required: ['nomeEmpresa', 'cnpj', 'valor', 'tipo'],
      },
    },
  },
];

async function executarFinalizacao(dados) {
  console.log('Dados extraídos:', dados);
  await sendEmail(dados);
  return `Proposta recebida! Obrigado, ${dados.nomeEmpresa}. Nossa equipe analisará e entrará em contato.`;
}

module.exports = { tools, executarFinalizacao };
