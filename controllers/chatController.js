const { getLLMResponse } = require('../services/llmService');

async function handleChat(req, res) {
  const { message, history } = req.body;

  try {
    const result = await getLLMResponse(message, history);
    res.json({ response: result });
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = { handleChat };
