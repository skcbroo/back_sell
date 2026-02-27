// tools/propostaTool.js (ESM)
import { sendEmail } from "../services/emailService.js"; // se você usa email na finalização

export const tools = [
  {
    type: "function",
    function: {
      name: "finalizar_proposta",
      description:
        "Finaliza a proposta quando todas as informações forem coletadas (nomeEmpresa, cnpj, valor, tipo, contato opcional).",
      parameters: {
        type: "object",
        properties: {
          nomeEmpresa: { type: "string" },
          cnpj: { type: "string" },
          valor: { type: "string" },
          tipo: { type: "string", enum: ["duplicata", "cheque", "contrato"] },
          contato: { type: "string" }
        },
        required: ["nomeEmpresa", "cnpj", "valor", "tipo"],
        additionalProperties: false
      }
    }
  }
];

export async function executarFinalizacao(dados) {
  // aqui você faz o que já fazia: enviar email, salvar, etc.
  await sendEmail(dados);

  return `Perfeito! Recebi os dados e já encaminhei a proposta.\n\n` +
    `Empresa: ${dados.nomeEmpresa}\n` +
    `CNPJ: ${dados.cnpj}\n` +
    `Valor: R$ ${dados.valor}\n` +
    `Tipo: ${dados.tipo}\n` +
    `Contato: ${dados.contato || "Não informado"}`;
}
