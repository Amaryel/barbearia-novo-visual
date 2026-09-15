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
   * @param {string|string[]} serviceIds - ID ou lista de IDs dos serviços
   * @param {string} barberId - ID do barbeiro ou "qualquer"
   * @param {number} [customDurationMinutes] - Duração opcional já somada
   * @returns {Promise<{ isOpen: boolean, reason?: string, slots: Array<{ time: string, endTime: string, freeBarbers: Array<{ id: string, name: string }> }> }>}
   */
  async getAvailableSlots(dateStr, serviceIds, barberId = "qualquer", customDurationMinutes = null) {
    if (!dateStr) {
      return { isOpen: false, reason: "Selecione uma data", slots: [] };
    }

    // 1. Obter serviços e somar duração
    let durationMinutes = customDurationMinutes || 0;
    if (!durationMinutes) {
      if (Array.isArray(serviceIds)) {
        for (const sId of serviceIds) {
          const srv = await serviceService.getById(sId);
          if (srv && srv.duration_minutes) {
            durationMinutes += srv.duration_minutes;
          }
        }
      } else if (serviceIds) {
        const service = await serviceService.getById(serviceIds);
        if (service && service.duration_minutes) {
          durationMinutes = service.duration_minutes;
        }
      }
    }
    if (!durationMinutes) durationMinutes = 30; // fallback seguro

    // 2. Determinar dia da semana
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
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
    let candidateBarbers = allBarbers;
    if (barberId && barberId !== "qualquer") {
      candidateBarbers = allBarbers.filter((b) => b.id === barberId);
    }
    if (candidateBarbers.length === 0) {
      candidateBarbers = allBarbers;
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

    const allSlots = [];
    const stepMinutes = 30; // Grade de 30 em 30 min

    // Data/hora atual para desabilitar horários passados se a data for hoje
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();
    const isToday = dateStr === todayIso;

    for (let current = openMinutes; current + durationMinutes <= closeMinutes; current += stepMinutes) {
      const slotStart = minutesToTimeString(current);
      const slotEnd = minutesToTimeString(current + durationMinutes);

      // Verificar se sobrepõe intervalo de almoço
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        const breakStart = minutesToTimeString(breakStartMinutes);
        const breakEnd = minutesToTimeString(breakEndMinutes);
        if (doTimeRangesOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
          continue; // Intervalo de almoço não entra na grade
        }
      }

      // Se for hoje e o horário já passou
      const isPast = isToday && (current + 10 <= currentMinutesNow);

      // Verificar quais barbeiros candidatos estão livres
      const freeBarbers = [];
      let isOccupiedByAppointment = false;
      let isBlockedByAdmin = false;

      for (const barber of candidateBarbers) {
        const isBlocked = blockedTimes.some((block) => {
          if (block.barber_id && block.barber_id !== barber.id) return false;
          if (block.is_full_day) return true;
          if (block.start_time && block.end_time) {
            return doTimeRangesOverlap(slotStart, slotEnd, block.start_time, block.end_time);
          }
          return false;
        });

        if (isBlocked) {
          isBlockedByAdmin = true;
          continue;
        }

        const hasAppointmentConflict = existingAppointments.some((apt) => {
          if (apt.barber_id && apt.barber_id !== barber.id && apt.barber_id !== "qualquer") {
            return false;
          }
          return doTimeRangesOverlap(slotStart, slotEnd, apt.start_time, apt.end_time);
        });

        if (hasAppointmentConflict) {
          isOccupiedByAppointment = true;
        } else {
          freeBarbers.push(barber);
        }
      }

      const isAvailable = !isPast && freeBarbers.length > 0;
      let status = "available";
      let statusLabel = "Livre";

      if (isPast) {
        status = "past";
        statusLabel = "Encerrado";
      } else if (isOccupiedByAppointment) {
        status = "occupied";
        statusLabel = "Ocupado";
      } else if (isBlockedByAdmin) {
        status = "blocked";
        statusLabel = "Bloqueado";
      } else if (!isAvailable) {
        status = "unavailable";
        statusLabel = "Indisponível";
      }

      allSlots.push({
        time: slotStart,
        endTime: slotEnd,
        isAvailable,
        status,
        statusLabel,
        freeBarbers: freeBarbers.map((b) => ({ id: b.id, name: b.name })),
      });
    }

    return {
      isOpen: true,
      businessHours,
      slots: allSlots,
      availableCount: allSlots.filter((s) => s.isAvailable).length,
      occupiedCount: allSlots.filter((s) => !s.isAvailable).length,
    };
  },
};
