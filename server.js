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

// --------------------
// CORS (robusto + debug)
// --------------------
const ALLOWED_ORIGINS = [
  "https://proposta.midlejcapital.com.br",
  "http://localhost:5173",
];

const FRONTEND_URL = process.env.FRONTEND_URL; // deve ser o domínio público do FRONT
if (!FRONTEND_URL) {
  console.warn("⚠️  FRONTEND_URL ausente no .env; usando lista padrão para debug.");
}
if (FRONTEND_URL && !ALLOWED_ORIGINS.includes(FRONTEND_URL)) {
  ALLOWED_ORIGINS.push(FRONTEND_URL);
}

const corsOptions = {
  origin: (origin, cb) => {
    // requests sem Origin (curl, Postman) passam
    if (!origin) return cb(null, true);
    const ok = ALLOWED_ORIGINS.includes(origin);
    if (ok) return cb(null, true);
    console.warn("⛔ CORS bloqueado para Origin:", origin);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true, // ok mesmo que você não use cookies; pode manter
};

// debug de início de request (você verá no Railway)
app.use((req, _res, next) => {
  console.log("📡", req.method, req.path, "| Origin:", req.headers.origin || "-");
  next();
});

app.use(cors(corsOptions));
// lida explicitamente com preflight (alguns proxies exigem)
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("🚀 API da Midlej Capital rodando com sucesso!");
});

// =========================
// ROTA: Logs de eventos DIY
// =========================
app.post("/api/logs", async (req, res) => {
  console.log("Body sample:", Array.isArray(req.body?.events) ? req.body.events[0] : req.body);
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
    console.error("Erro ao registrar log:", error);
    res.status(500).json({ error: "Erro ao registrar log" });
  }
});

// =========================
// INICIALIZAÇÃO DO SERVIDOR
// =========================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`✅ FRONTEND_URL: ${FRONTEND_URL || "(lista padrão de debug)"}`);
  console.log("✅ ALLOWED_ORIGINS:", ALLOWED_ORIGINS);
});
