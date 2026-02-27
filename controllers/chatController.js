import { getLLMResponse } from '../services/llmService.js';
import { executarFinalizacao } from '../tools/propostaTool.js';

export async function handleChat(req, res) {
  const { message, history } = req.body;

  try {
    const result = await getLLMResponse(message, history);
    
    // Se o LLM chamou a ferramenta, 'result' já contém a resposta final
    res.json({ response: result });
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}
