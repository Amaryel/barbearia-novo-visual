import { storage, STORAGE_KEYS } from "./storage";
import { DEFAULT_BARBERSHOP_ID } from "../types/database";

function addMinutesToTime(timeHHMM, minutesToAdd) {
  if (!timeHHMM) return timeHHMM;
  const [h, m] = timeHHMM.split(":").map(Number);
  const total = h * 60 + m + minutesToAdd;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export function formatDateBR(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function buildClientWhatsappLink(appointment, businessPhone = "5589994367235", businessName = "Barbearia Novo Visual") {
  const lines = [
    `Olá! Gostaria de confirmar meu agendamento na ${businessName}:`,
    `✂️ Serviço: ${appointment.service_name}`,
    `💈 Profissional: ${appointment.barber_name}`,
    `📅 Data: ${formatDateBR(appointment.date)}`,
    `⏰ Horário: ${appointment.start_time}`,
    `👤 Nome: ${appointment.customer_name}`,
    `📱 Telefone: ${appointment.customer_phone}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${businessPhone}?text=${text}`;
}

export function buildAdminToClientWhatsappLink(appointment, businessName = "Barbearia Novo Visual") {
  const cleanPhone = (appointment.customer_phone || "").replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const lines = [
    `Olá ${appointment.customer_name.split(" ")[0]}!`,
    `Confirmamos seu agendamento na ${businessName}:`,
    `✂️ Serviço: ${appointment.service_name}`,
    `💈 Barbeiro: ${appointment.barber_name}`,
    `📅 Data: ${formatDateBR(appointment.date)}`,
    `⏰ Horário: ${appointment.start_time}`,
    `Ficamos no aguardo! Caso precise reagendar, avise por aqui.`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${formattedPhone}?text=${text}`;
}

/**
 * Serviço de gerenciamento de Agendamentos
 * Preparado para substituir por: supabase.from('appointments')
 */
export const appointmentService = {
  async getAll(filters = {}) {
    let list = storage.get(STORAGE_KEYS.APPOINTMENTS, []);

    if (filters.date) {
      list = list.filter((a) => a.date === filters.date);
    }
    if (filters.barber_id && filters.barber_id !== "all") {
      list = list.filter((a) => a.barber_id === filters.barber_id);
    }
    if (filters.status && filters.status !== "all") {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.customer_name.toLowerCase().includes(q) ||
          a.customer_phone.includes(q) ||
          a.service_name.toLowerCase().includes(q)
      );
    }

    // Ordenar por data asc, depois por start_time asc
    return list.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start_time.localeCompare(b.start_time);
    });
  },

  async getById(id) {
    const list = storage.get(STORAGE_KEYS.APPOINTMENTS, []);
    return list.find((a) => a.id === id) || null;
  },

  async create(data) {
    const list = storage.get(STORAGE_KEYS.APPOINTMENTS, []);
    const duration = Number(data.duration_minutes) || 30;
    const start_time = data.start_time || data.time;
    const end_time = data.end_time || addMinutesToTime(start_time, duration);

    const newAppointment = {
      id: "apt-" + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()),
      barbershop_id: data.barbershop_id || DEFAULT_BARBERSHOP_ID,
      customer_id: data.customer_id || "cust-" + Date.now(),
      customer_name: data.customer_name ? data.customer_name.trim() : (data.name ? data.name.trim() : "Cliente"),
      customer_phone: data.customer_phone ? data.customer_phone.trim() : (data.phone ? data.phone.trim() : ""),
      service_id: data.service_id || data.serviceId || "",
      service_name: data.service_name || data.serviceName || "Serviço",
      service_price: Number(data.service_price || data.price) || 0,
      duration_minutes: duration,
      barber_id: data.barber_id || data.barberId || "qualquer",
      barber_name: data.barber_name || data.barberName || "Qualquer disponível",
      date: data.date,
      start_time: start_time,
      end_time: end_time,
      status: data.status || "confirmed",
      notes: data.notes ? data.notes.trim() : "",
      created_at: new Date().toISOString(),
    };

    list.push(newAppointment);
    storage.set(STORAGE_KEYS.APPOINTMENTS, list);
    return newAppointment;
  },

  async update(id, updates) {
    const list = storage.get(STORAGE_KEYS.APPOINTMENTS, []);
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Agendamento não encontrado");

    const current = list[index];
    const duration = updates.duration_minutes !== undefined ? Number(updates.duration_minutes) : current.duration_minutes;
    const start_time = updates.start_time || current.start_time;
    const end_time = updates.end_time || (start_time ? addMinutesToTime(start_time, duration) : current.end_time);

    const updated = {
      ...current,
      ...updates,
      duration_minutes: duration,
      start_time,
      end_time,
    };

    list[index] = updated;
    storage.set(STORAGE_KEYS.APPOINTMENTS, list);
    return updated;
  },

  async updateStatus(id, newStatus) {
    return this.update(id, { status: newStatus });
  },

  async delete(id) {
    const list = storage.get(STORAGE_KEYS.APPOINTMENTS, []);
    const filtered = list.filter((a) => a.id !== id);
    storage.set(STORAGE_KEYS.APPOINTMENTS, filtered);
    return true;
  },

  async getDashboardMetrics(todayDateStr) {
    const today = todayDateStr || new Date().toISOString().slice(0, 10);
    const all = storage.get(STORAGE_KEYS.APPOINTMENTS, []);
    const todayAppointments = all.filter((a) => a.date === today && a.status !== "cancelled");
    const completedToday = todayAppointments.filter((a) => a.status === "completed");
    const activeToday = todayAppointments.filter((a) => a.status === "confirmed" || a.status === "pending");

    // Próximo atendimento hoje
    const nowTime = new Date().toTimeString().slice(0, 5);
    const upcomingToday = todayAppointments
      .filter((a) => a.status !== "completed" && a.start_time >= nowTime)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    const nextAppointment = upcomingToday.length > 0 ? upcomingToday[0] : (activeToday[0] || null);

    const revenueToday = completedToday.reduce((acc, cur) => acc + (cur.service_price || 0), 0);
    const potentialRevenueToday = todayAppointments.reduce((acc, cur) => acc + (cur.service_price || 0), 0);

    return {
      todayCount: todayAppointments.length,
      completedCount: completedToday.length,
      pendingCount: activeToday.length,
      nextAppointment,
      revenueToday,
      potentialRevenueToday,
      todayList: todayAppointments.sort((a, b) => a.start_time.localeCompare(b.start_time)),
    };
  },
};
