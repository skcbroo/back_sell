import { getLLMResponse } from "../services/llmService.js"; // ajuste o caminho/nome se for outro

export async function handleChat(req, res) {
  try {
    const { message, history } = req.body || {};
    const resposta = await getLLMResponse(message, history || []);
    return res.json({ reply: resposta });
  } catch (err) {
    console.error("handleChat error:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
