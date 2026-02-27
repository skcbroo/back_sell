// server.js (ESM)
import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// CORS
app.use(cors());

// Captura body cru + parse JSON
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf?.toString("utf8");
    },
  })
);

// Tratamento de JSON inválido (evita crash e mostra de onde veio)
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    console.error("❌ JSON inválido:", {
      method: req.method,
      url: req.originalUrl,
      contentType: req.headers["content-type"],
      rawBodyStart: (req.rawBody || "").slice(0, 120),
    });

    return res.status(400).json({
      error:
        "JSON inválido. Envie Content-Type: application/json e body com aspas duplas (use JSON.stringify).",
    });
  }
  next(err);
});

// Rotas
app.use("/api", chatRoutes);

// Healthcheck (útil pro Railway)
app.get("/", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
