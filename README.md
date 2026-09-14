# Barbearia Novo Visual — Site institucional com agendamento

Site institucional de uma página (landing page com âncoras) para a **Barbearia
Novo Visual**, em Picos-PI. Construído com **Vite + React (JavaScript)**,
sem bibliotecas de UI pesadas, com CSS puro baseado em variáveis (design
tokens).

React foi escolhido em vez de vanilla JS porque o núcleo do site — o fluxo de
agendamento em várias etapas, com validação e estado (serviço, profissional,
data, horário, dados do cliente) — fica muito mais simples de gerenciar com
estado de componente do que manipulando o DOM manualmente.

## Como rodar

```bash
npm install
npm run dev        # ambiente de desenvolvimento, com hot reload
npm run build      # gera a build de produção em /dist
npm run preview    # serve a build de produção localmente
npm run lint       # checagem de qualidade de código (oxlint)
```

## Assistente de IA

O botão no canto inferior direito abre um chat que usa a API da OpenAI por
meio da rota de servidor `POST /api/chat`. A chave nunca é enviada ao
navegador: copie `.env.example` para `.env`, informe `OPENAI_API_KEY` e rode:

```bash
npm run build
npm start
```

O servidor entrega a pasta `dist` e a rota do chat em `http://localhost:8787`.
Durante o desenvolvimento, deixe `npm run server` e `npm run dev` em terminais
separados; o Vite encaminha `/api` para o servidor. Não crie uma variável
`VITE_OPENAI_API_KEY`, pois variáveis com esse prefixo ficam expostas no cliente.

## Estrutura de pastas

```
src/
  components/   → Header e Footer (usados em todas as páginas/seções)
  sections/     → cada seção da landing page (Hero, About, Services, ...)
  styles/       → tokens.css — variáveis de cor, tipografia e espaçamento
  utils/        → data.js (dados do negócio) e booking.js (lógica de agendamento)
  App.jsx       → monta as seções na ordem da página
  main.jsx      → ponto de entrada do React
public/
  favicon.svg   → ícone do site
```

## O que foi implementado

- **Header fixo** com navegação por âncoras e menu responsivo (hambúrguer no mobile).
- **Hero** com posicionamento de marca e dois CTAs (Agendar / WhatsApp).
- **Sobre**, **Serviços** (cards estilo "ticket", com preços e durações de
  exemplo) e **Galeria** (fotos placeholder do Unsplash, com `loading="lazy"`).
- **Agendamento online funcional em 4 passos**: serviço → profissional → data/
  horário → dados do cliente, com validação de campos obrigatórios e
  simulação de horários já ocupados.
- **Persistência local**: os agendamentos são salvos no `localStorage` do
  navegador (chave `novo-visual:agendamentos`), então o fluxo funciona de
  ponta a ponta mesmo sem backend.
- **Confirmação via WhatsApp**: ao confirmar, é gerado um link
  `https://wa.me/5589994367235?text=...` já preenchido com os dados do
  agendamento, para o cliente reforçar a reserva diretamente com a barbearia.
- **Localização** com endereço de exemplo, horário de funcionamento e mapa
  incorporado (iframe do Google Maps).
- **Contato/Rodapé** com telefone clicável (`tel:`), link de WhatsApp,
  redes sociais (placeholders) e mini formulário de contato com validação.
- **SEO básico**: título, meta description, Open Graph e favicon.
- **Acessibilidade básica**: `alt` em todas as imagens, `label` em todos os
  campos de formulário, contraste adequado, foco visível no teclado.
- **Assistente virtual**: widget responsivo de conversa com histórico curto,
  validação de payload no servidor e integração segura com a Responses API.

## O que precisa ser configurado com dados reais

Antes de publicar, substituir:

1. **Endereço** e **embed do mapa** em `src/utils/data.js` (`BUSINESS.address`
   e `BUSINESS.mapsEmbedSrc`) pelo endereço e embed reais da barbearia.
2. **Horário de funcionamento** (`BUSINESS.hours`).
3. **Preços e durações dos serviços** (`SERVICES`, em `src/utils/data.js`) —
   estão marcados como exemplo.
4. **Nomes dos profissionais** (`BARBERS`).
5. **Fotos** da galeria e do hero — atualmente usam imagens do Unsplash como
   placeholder; trocar por fotos reais do ambiente e dos cortes.
6. **Redes sociais** (`BUSINESS.socials`) — links estão vazios (`#`).

## Próximos passos sugeridos (evolução do projeto)

O agendamento hoje funciona inteiramente no front-end. Os pontos exatos onde
substituir por uma API real estão comentados no código
(`src/utils/booking.js` e `src/components/Footer.jsx`, marcados com
"PONTO DE INTEGRAÇÃO FUTURA"). Em resumo, os próximos passos são:

- **Backend de agendamento real** (Firebase, Supabase ou API própria) para
  substituir o `localStorage`, permitindo que a agenda seja compartilhada
  entre todos os dispositivos e não apenas o navegador do cliente.
- **Notificações automáticas** (WhatsApp Business API, SMS ou e-mail) para
  confirmar o agendamento sem depender do cliente reenviar a mensagem.
- **Painel administrativo** para o dono da barbearia visualizar, confirmar e
  gerenciar os agendamentos recebidos, além de bloquear horários manualmente.
- **Envio real do formulário de contato** do rodapé (hoje ele só confirma o
  recebimento na tela) para um endpoint de e-mail ou CRM.
