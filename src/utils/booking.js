import { BUSINESS } from "./data";

const STORAGE_KEY = "novo-visual:agendamentos";

/*
  PONTO DE INTEGRAÇÃO FUTURA
  ---------------------------------------------------------------
  Toda a persistência abaixo usa localStorage apenas como uma
  simulação de backend, para que o fluxo de agendamento funcione
  de ponta a ponta sem servidor. Quando houver uma API real
  (Firebase, Supabase, ou API própria), substituir:

    - saveBooking(booking)  →  POST /agendamentos
    - listBookings()        →  GET /agendamentos
    - isSlotTaken(...)      →  checagem de disponibilidade no backend

  O formato de `booking` abaixo pode ser usado como referência
  para o schema da tabela/coleção de agendamentos.
*/

export function listBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Não foi possível ler os agendamentos salvos:", error);
    return [];
  }
}

export function saveBooking(booking) {
  const bookings = listBookings();
  const withId = { ...booking, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  bookings.push(withId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error("Não foi possível salvar o agendamento:", error);
  }
  return withId;
}

export function isSlotTakenLocally(date, time) {
  return listBookings().some((booking) => booking.date === date && booking.time === time);
}

export function buildWhatsappLink(booking) {
  const lines = [
    `Olá! Gostaria de confirmar meu agendamento na ${BUSINESS.name}:`,
    `Serviço: ${booking.serviceName}`,
    `Profissional: ${booking.barberName}`,
    `Data: ${formatDateBR(booking.date)}`,
    `Horário: ${booking.time}`,
    `Nome: ${booking.name}`,
    `Telefone: ${booking.phone}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${text}`;
}

export function formatDateBR(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
