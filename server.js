// ====================
// CONFIGURAÇÕES INICIAIS
// ====================
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// ====================
// CONFIGURAR CORS ROBUSTO
// ====================
const FRONTEND_URL = "https://frontsell-sell.up.railway.app";
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
};

// Middleware de CORS
app.use(cors(corsOptions));

// Tratamento manual de preflight (evita crash com `*`)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === FRONTEND_URL) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // resposta rápida pro navegador
  }
  next();
});

// Parser de JSON
app.use(express.json());

// ====================
// ROTA DE TESTE
// ====================
app.get("/", (req, res) => {
  res.send("🚀 API da Midlej Capital rodando com sucesso!");
});

// ====================
// ROTA: Logs de eventos DIY
// ====================
app.post("/api/logs", async (req, res) => {
  console.log(
    "📡 Body sample:",
    Array.isArray(req.body?.events) ? req.body.events[0] : req.body
  );

  try {
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    if (events.length === 0) {
      return res.status(400).json({ error: "Nenhum evento recebido" });
    }

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

    const result = await Promise.all(
      sanitized.map((data) => prisma.logEvent.create({ data }))
    );

    res.json({ ok: true, received: sanitized.length, inserted: result.length });
  } catch (error) {
    console.error("❌ Erro ao registrar log:", error);
    res.status(500).json({ error: "Erro ao registrar log" });
  }
});

// ====================
// ROTA EXTRA: últimos logs (debug)
// ====================
app.get("/api/logs/latest", async (req, res) => {
  try {
    const logs = await prisma.logEvent.findMany({
      orderBy: { id: "desc" },
      take: 20,
    });
    res.json(logs);
  } catch (error) {
    console.error("❌ Erro ao buscar logs:", error);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
});

// ====================
// INICIALIZAÇÃO DO SERVIDOR
// ====================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`✅ Aceitando requisições de: ${FRONTEND_URL}`);
});
