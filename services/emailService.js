const nodemailer = require('nodemailer');

async function sendEmail(dados) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'Nova proposta de direitos creditórios',
    text: `
      Nome da Empresa: ${dados.nomeEmpresa}
      CNPJ: ${dados.cnpj}
      Valor: R$ ${dados.valor}
      Tipo: ${dados.tipo}
      Contato: ${dados.contato || 'Não informado'}
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log('E-mail enviado com sucesso');
}

module.exports = { sendEmail };
