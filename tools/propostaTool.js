// tools/propostaTool.js
const { sendEmail } = require('../services/emailService');

const tools = [
  {
    type: 'function',
    function: {
      name: 'finalizar_prioridade',
      description: 'Chame quando o cliente informar sua prioridade e o telefone para contato.',
      parameters: {
        type: 'object',
        properties: {
          prioridade: {
            type: 'string',
            enum: [
              'Despesas médicas próprias ou de familiares',
              'Pagamento de dívidas e organização financeira',
              'Comprar um novo carro',
              'Comprar um apartamento',
              'Investir em negócio próprio'
            ],
            description: 'A prioridade escolhida pelo cliente.'
          },
          telefone: {
            type: 'string',
            description: 'Número de telefone para contato (com DDD).'
          }
        },
        required: ['prioridade', 'telefone']
      }
    }
  }
];

async function executarFinalizacao(dados) {
  console.log('Dados coletados:', dados);

  // Envia e-mail para o administrador com as informações
  await sendEmail(dados);

  return `Obrigado por compartilhar sua prioridade! Um de nossos especialistas entrará em contato pelo telefone ${dados.telefone} em breve.`;
}

module.exports = { tools, executarFinalizacao };
