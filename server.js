import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


// =========================
// ROTA: Solicitação de venda
// =========================
app.post("/api/solicitacoes", async (req, res) => {
  try {
    const { nome, cpfCnpj, telefone, email, numeroProcesso, valorCausa } = req.body;

    const cedente = await prisma.cedente.create({
      data: {
        nome,
        cpfCnpj,
        telefone,
        email,
        creditos: {
          create: {
            numeroProcesso,
            valorCausa: parseFloat(valorCausa),
          }
        }
      },
    });

    res.status(201).json({ message: "Solicitação registrada com sucesso!", cedente });
  } catch (error) {
    console.error("Erro ao registrar solicitação:", error);
    res.status(500).json({ error: "Erro ao registrar solicitação" });
  }
});


// =========================
// ROTA: Logs de eventos DIY
// =========================
app.post("/api/logs", async (req, res) => {
  try {
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    if (events.length === 0) {
      return res.status(400).json({ error: "Nenhum evento recebido" });
    }

    // Sanitiza dados básicos
    const sanitized = events.map((e) => ({
      type: String(e?.type || "unknown").slice(0, 64),
      ts: new Date(e?.ts || Date.now()),
      sessionId: e?.sessionId ? String(e.sessionId).slice(0, 128) : null,
      userId: e?.userId ? String(e.userId).slice(0, 128) : null,
      url: e?.url ? String(e.url).slice(0, 2048) : null,
      referrer: e?.referrer ? String(e.referrer).slice(0, 2048) : null,
      ua: e?.ua ? String(e.ua).slice(0, 512) : null,
      lang: e?.lang ? String(e.lang).slice(0, 16) : null,
      props: e?.props && typeof e.props === "object" ? e.props : {},
    }));

    await prisma.logEvent.createMany({
      data: sanitized.map((e) => ({
        type: e.type,
        ts: e.ts,
        sessionId: e.sessionId,
        userId: e.userId,
        url: e.url,
        referrer: e.referrer,
        ua: e.ua,
        lang: e.lang,
        props: e.props,
      })),
    });

    res.json({ ok: true, received: sanitized.length });
  } catch (error) {
    console.error("Erro ao registrar log:", error);
    res.status(500).json({ error: "Erro ao registrar log" });
  }
});


// =========================
// Start
// =========================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
