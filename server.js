import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// ====== CONFIG ======
const FRONTEND_URL = (process.env.FRONTEND_URL || "").trim() || "http://localhost:5173";

// ====== LOGGER GLOBAL (antes de tudo)
app.use((req, _res, next) => {
  console.log(
    "📡", req.method, req.path,
    "| origin:", req.headers.origin || "-",
    "| ua:", (req.headers["user-agent"] || "").slice(0, 30)
  );
  next();
});

// ====== CORS (modo debug seguro)
const ALLOWED = new Set([FRONTEND_URL, "http://localhost:5173"]);
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);               // curl/insomnia
    if (ALLOWED.has(origin)) return cb(null, true);   // origem conhecida
    console.warn("⛔ CORS bloqueado p/ origin:", origin);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ====== HANDLER DE PREFLIGHT (sem wildcard *)
app.options("/api/logs", cors(corsOptions), (req, res) => {
  res.sendStatus(204);
});
app.options("/api/*", cors(corsOptions), (req, res) => {
  res.sendStatus(204);
});

// ====== ROTA SAÚDE
app.get("/", (_req, res) => {
  res.send("🚀 API da Midlej Capital rodando com sucesso!");
});

// ====== ROTA DEBUG: ecoa headers (para conferir Origin que chega)
app.get("/api/debug/headers", (req, res) => {
  res.json({ headers: req.headers, FRONTEND_URL });
});

// ====== ROTA LOGS
app.post("/api/logs", async (req, res) => {
  try {
    const body = req.body;
    console.log("🧩 Body tipo:", typeof body, "| keys:", body && Object.keys(body));
    const events = Array.isArray(body?.events) ? body.events : [];

    if (events.length === 0) {
      console.warn("⚠️ Nenhum evento no body");
      return res.status(400).json({ error: "Nenhum evento recebido" });
    }

    console.log("✅ Primeiro evento:", events[0]);

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

    return res.json({ ok: true, received: sanitized.length, inserted: result.length });
  } catch (error) {
    console.error("❌ Erro ao registrar log:", error);
    return res.status(500).json({ error: "Erro ao registrar log" });
  }
});

// ====== START
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend na porta ${PORT}`);
  console.log(`✅ FRONTEND_URL permitido: ${FRONTEND_URL}`);
});
