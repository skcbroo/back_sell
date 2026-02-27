// tools/propostaTool.js
import { sendEmail } from "../services/emailService.js";

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
          nomeEmpresa: { type: "string", description: "Nome da empresa" },
          cnpj: { type: "string", description: "CNPJ (com ou sem máscara)" },
          valor: { type: "string", description: "Valor da proposta (ex: 100000 ou 100.000,00)" },
          tipo: {
            type: "string",
            enum: ["duplicata", "cheque", "contrato"],
            description: "Tipo do crédito"
          },
          contato: { type: "string", description: "Telefone/e-mail/contato (opcional)" }
        },
        required: ["nomeEmpresa", "cnpj", "valor", "tipo"],
        additionalProperties: false
      }
    }
  }
];

function normalizeTipo(tipo) {
  const t = String(tipo || "").trim().toLowerCase();
  if (t.includes("dupl")) return "duplicata";
  if (t.includes("cheq")) return "cheque";
  if (t.includes("contr")) return "contrato";
  return t; // se já vier correto
}

export async function executarFinalizacao(dados) {
  const payload = dados || {};

  const nomeEmpresa = String(payload.nomeEmpresa || "").trim();
  const cnpj = String(payload.cnpj || "").trim();
  const valor = String(payload.valor || "").trim();
  const tipo = normalizeTipo(payload.tipo);
  const contato = String(payload.contato || "").trim();

  // validação mínima (evita mandar email vazio)
  const faltando = [];
  if (!nomeEmpresa) faltando.push("nomeEmpresa");
  if (!cnpj) faltando.push("cnpj");
  if (!valor) faltando.push("valor");
  if (!tipo) faltando.push("tipo");

  if (faltando.length) {
    return `Quase lá — faltou(m) o(s) campo(s): ${faltando.join(", ")}. Pode me informar?`;
  }

  // envia email
  await sendEmail({ nomeEmpresa, cnpj, valor, tipo, contato });

  // retorno pro usuário
  return (
    `✅ Proposta registrada e encaminhada!\n\n` +
    `Empresa: ${nomeEmpresa}\n` +
    `CNPJ: ${cnpj}\n` +
    `Valor: R$ ${valor}\n` +
    `Tipo: ${tipo}\n` +
    `Contato: ${contato || "Não informado"}`
  );
}
