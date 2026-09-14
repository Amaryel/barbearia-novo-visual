import express from "express";
import OpenAI from "openai";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const port = process.env.PORT || 8787;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "32kb" }));

app.post("/api/chat", async (request, response) => {
  const messages = request.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10 || messages.some(({ role, content }) => !["user", "assistant"].includes(role) || typeof content !== "string" || content.length > 800)) {
    return response.status(400).json({ error: "Mensagem inválida." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: "O assistente ainda não foi configurado. Adicione OPENAI_API_KEY no servidor." });
  }
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: "Você é o assistente virtual da barbearia Novo Visual. Responda em português brasileiro, de modo cordial e objetivo. Ajude sobre serviços, agendamento e localização. Não invente preços, horários, disponibilidade ou confirmações de reserva; encaminhe para o agendamento quando faltar informação.",
      input: messages.map(({ role, content }) => ({ role, content })),
      max_output_tokens: 300,
    });
    return response.json({ reply: result.output_text || "Não consegui elaborar uma resposta agora." });
  } catch (error) {
    console.error("Chat API error:", error?.message);
    return response.status(502).json({ error: "O assistente está indisponível no momento. Tente novamente em instantes." });
  }
});

app.use(express.static(path.join(__dirname, "dist")));
app.get("/{*path}", (_request, response) => response.sendFile(path.join(__dirname, "dist", "index.html")));
app.listen(port, () => console.log(`Servidor disponível em http://localhost:${port}`));
