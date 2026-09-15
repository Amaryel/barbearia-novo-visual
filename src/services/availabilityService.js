import { businessHoursService } from "./businessHoursService";
import { blockedTimeService } from "./blockedTimeService";
import { appointmentService } from "./appointmentService";
import { barberService } from "./barberService";
import { serviceService } from "./serviceService";

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function doTimeRangesOverlap(startA, endA, startB, endB) {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);
  return sA < eB && eA > sB;
}

export const availabilityService = {
  /**
   * Calcula horários disponíveis para agendamento
   * @param {string} dateStr - YYYY-MM-DD
   * @param {string} serviceId - ID do serviço
   * @param {string} barberId - ID do barbeiro ou "qualquer"
   * @returns {Promise<{ isOpen: boolean, reason?: string, slots: Array<{ time: string, barberIds: string[] }> }>}
   */
  async getAvailableSlots(dateStr, serviceId, barberId = "qualquer") {
    if (!dateStr) {
      return { isOpen: false, reason: "Selecione uma data", slots: [] };
    }

    // 1. Obter serviço e duração
    let durationMinutes = 30;
    if (serviceId) {
      const service = await serviceService.getById(serviceId);
      if (service && service.duration_minutes) {
        durationMinutes = service.duration_minutes;
      }
    }

    // 2. Determinar dia da semana
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0); // meio dia para evitar timezone shifting
    const dayOfWeek = dateObj.getDay();

    // 3. Obter regras de horário de funcionamento
    const businessHours = await businessHoursService.getByDayOfWeek(dayOfWeek);
    if (!businessHours || !businessHours.is_open) {
      return {
        isOpen: false,
        reason: businessHours
          ? `Fechado aos ${businessHours.day_name}s`
          : "Estabelecimento fechado neste dia",
        slots: [],
      };
    }

    // 4. Obter barbeiros candidatos
    const allBarbers = await barberService.getAll(true);
    if (allBarbers.length === 0) {
      return { isOpen: false, reason: "Nenhum barbeiro ativo no momento", slots: [] };
    }

    let candidateBarbers = allBarbers;
    if (barberId && barberId !== "qualquer") {
      candidateBarbers = allBarbers.filter((b) => b.id === barberId);
      if (candidateBarbers.length === 0) {
        return { isOpen: false, reason: "Profissional selecionado não encontrado ou inativo", slots: [] };
      }
    }

    // 5. Obter agendamentos e bloqueios da data
    const existingAppointments = (await appointmentService.getAll({ date: dateStr })).filter(
      (a) => a.status !== "cancelled"
    );
    const blockedTimes = await blockedTimeService.getByDate(dateStr);

    const openMinutes = parseTimeToMinutes(businessHours.open_time);
    const closeMinutes = parseTimeToMinutes(businessHours.close_time);
    const breakStartMinutes = businessHours.break_start ? parseTimeToMinutes(businessHours.break_start) : null;
    const breakEndMinutes = businessHours.break_end ? parseTimeToMinutes(businessHours.break_end) : null;

    const availableSlots = [];
    const stepMinutes = 30; // Granularidade da grade de horários

    for (let current = openMinutes; current + durationMinutes <= closeMinutes; current += stepMinutes) {
      const slotStart = minutesToTimeString(current);
      const slotEnd = minutesToTimeString(current + durationMinutes);

      // Verificar se sobrepõe intervalo de almoço
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        const breakStart = minutesToTimeString(breakStartMinutes);
        const breakEnd = minutesToTimeString(breakEndMinutes);
        if (doTimeRangesOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
          continue; // Pula este slot pois bate no horário de almoço
        }
      }

      // Verificar quais barbeiros candidatos estão livres neste intervalo exato
      const freeBarbers = [];

      for (const barber of candidateBarbers) {
        // Checar bloqueios deste barbeiro (ou bloqueios gerais onde barber_id === null)
        const isBlocked = blockedTimes.some((block) => {
          if (block.barber_id && block.barber_id !== barber.id) return false;
          if (block.is_full_day) return true;
          if (block.start_time && block.end_time) {
            return doTimeRangesOverlap(slotStart, slotEnd, block.start_time, block.end_time);
          }
          return false;
        });

        if (isBlocked) continue;

        // Checar agendamentos existentes deste barbeiro
        const hasAppointmentConflict = existingAppointments.some((apt) => {
          if (apt.barber_id !== barber.id && apt.barber_id !== "qualquer") {
            return false;
          }
          return doTimeRangesOverlap(slotStart, slotEnd, apt.start_time, apt.end_time);
        });

        if (!hasAppointmentConflict) {
          freeBarbers.push(barber);
        }
      }

      if (freeBarbers.length > 0) {
        availableSlots.push({
          time: slotStart,
          endTime: slotEnd,
          freeBarbers: freeBarbers.map((b) => ({ id: b.id, name: b.name })),
        });
      }
    }

    return {
      isOpen: true,
      businessHours,
      slots: availableSlots,
    };
  },
};
