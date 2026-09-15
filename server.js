import express from "express";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app = express();
const port = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "32kb" }));

const SYSTEM_INSTRUCTION_PT_BR = `Você é o assistente virtual oficial e exclusivo da Barbearia Novo Visual, localizada em Picos - PI.
DIRETRIZES DE RESPOSTA OBRIGATÓRIAS:
1. Responda SEMPRE em Português do Brasil (PT-BR).
2. Mantenha um tom profissional, acolhedor, refinado e prestativo.
3. Informações da barbearia:
   - Nome: Barbearia Novo Visual
   - Cidade: Picos, PI (Rua das Flores, 120 - Centro)
   - Horário de Funcionamento: Segunda a Sábado das 08:00 às 18:00 (Domingo fechado)
   - Serviços principais: Corte de Cabelo (R$ 45), Barboterapia / Barba na Toalha Quente (R$ 35), Combo Corte + Barba (R$ 70), Acabamento / Pezinho (R$ 20), Tratamento Capilar (R$ 55).
   - Equipe: Marcos Almeida (Degradê e Barba), Lucas Ferreira (Tesoura e Visagismo).
   - Agendamento: O cliente pode agendar diretamente no botão "Agendar horário" no site ou pelo WhatsApp oficial.
4. Seja conciso e direto. Se o cliente perguntar como agendar, oriente-o a usar a seção de agendamento na página.`;

// Fallback inteligente em PT-BR para respostas imediatas quando não houver chave de API configurada
function getSmartFallbackReply(userMessage) {
  const msg = (userMessage || "").toLowerCase();

  if (msg.includes("preço") || msg.includes("valor") || msg.includes("quanto custa") || msg.includes("tabela")) {
    return "Nossos principais serviços são: Corte Tradicional/Degradê (R$ 45), Barba na Toalha Quente (R$ 35), Combo Corte + Barba (R$ 70) e Acabamento/Pezinho (R$ 20). Você pode conferir todos os detalhes e agendar diretamente no botão 'Agendar horário' acima!";
  }

  if (msg.includes("horário") || msg.includes("hora") || msg.includes("aberto") || msg.includes("funciona") || msg.includes("atende")) {
    return "Nosso atendimento acontece de Segunda a Sábado, das 08:00 às 18:00 (com intervalo de almoço das 12:00 às 13:00). Aos domingos estamos fechados.";
  }

  if (msg.includes("onde") || msg.includes("endereço") || msg.includes("local") || msg.includes("fica") || msg.includes("picos")) {
    return "Estamos localizados na Rua das Flores, 120 - Centro, Picos - PI. Um espaço moderno e climatizado esperando por você!";
  }

  if (msg.includes("agendar") || msg.includes("marcar") || msg.includes("reserva") || msg.includes("vaga") || msg.includes("horario disponivel")) {
    return "Você pode marcar seu horário agora mesmo aqui pelo site clicando no botão 'Agendar horário' ou na seção de Agendamento Online logo abaixo!";
  }

  if (msg.includes("barbeiro") || msg.includes("profissional") || msg.includes("equipe") || msg.includes("marcos") || msg.includes("lucas")) {
    return "Nossa equipe conta com profissionais renomados como Marcos Almeida (especialista em degradê e barba) e Lucas Ferreira (especialista em cortes clássicos na tesoura e visagismo).";
  }

  return "Olá! Sou o assistente da Barbearia Novo Visual. Posso te ajudar com dúvidas sobre nossos cortes, barba, horários de atendimento, endereço em Picos-PI ou como agendar seu horário online. Em que posso te ajudar hoje?";
}

app.post("/api/chat", async (request, response) => {
  const messages = request.body?.messages;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > 15 ||
    messages.some(
      ({ role, content }) =>
        !["user", "assistant"].includes(role) ||
        typeof content !== "string" ||
        content.length > 1000
    )
  ) {
    return response.status(400).json({ error: "Mensagem inválida para processamento." });
  }

  const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

  // 1. Tenta usar Gemini se GEMINI_API_KEY estiver configurado
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const conversationHistory = messages
        .map((m) => `${m.role === "user" ? "Cliente" : "Assistente"}: ${m.content}`)
        .join("\n");

      const prompt = `${SYSTEM_INSTRUCTION_PT_BR}\n\nHistórico da conversa:\n${conversationHistory}\n\nResponda ao cliente em Português do Brasil:`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const reply = result.text?.trim();
      if (reply) {
        return response.json({ reply });
      }
    } catch (geminiError) {
      console.warn("Gemini API fallback to OpenAI / Local:", geminiError?.message);
    }
  }

  // 2. Tenta usar OpenAI se OPENAI_API_KEY estiver configurado
  if (process.env.OPENAI_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const result = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION_PT_BR },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
        max_tokens: 350,
      });
      const reply = result.choices?.[0]?.message?.content?.trim();
      if (reply) {
        return response.json({ reply });
      }
    } catch (openAiError) {
      console.warn("OpenAI API fallback to local:", openAiError?.message);
    }
  }

  // 3. Fallback inteligente estruturado 100% em PT-BR
  const fallbackReply = getSmartFallbackReply(lastUserMessage);
  return response.json({ reply: fallbackReply });
});

if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("/{*path}", (_request, response) =>
    response.sendFile(path.join(distPath, "index.html"))
  );
}

app.listen(port, "0.0.0.0", () =>
  console.log(`Servidor rodando com sucesso na porta ${port}`)
);
