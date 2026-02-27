import OpenAI from "openai";
import { tools, executarFinalizacao } from "../tools/propostaTool.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getLLMResponse(userMessage, history = []) {
  const messages = [
    {
      role: "system",
      content:
        "Você é um assistente que coleta informações para propostas de direitos creditórios. As informações necessárias: nome da empresa, CNPJ, valor, tipo (duplicata/cheque/contrato). Seja educado. Quando tiver tudo, chame a ferramenta finalizar_proposta.",
    },
    ...(history || []),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools,
    tool_choice: "auto",
  });

  const responseMessage = response.choices?.[0]?.message;

  if (responseMessage?.tool_calls?.length) {
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall?.function?.name === "finalizar_proposta") {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const confirmacao = await executarFinalizacao(args);
        return confirmacao;
      }
    }
  }

  return responseMessage?.content || "Desculpe, não entendi.";
}
