import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Cadastrar solicitação de venda
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
