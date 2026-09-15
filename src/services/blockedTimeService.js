import { storage, STORAGE_KEYS } from "./storage";
import { DEFAULT_BARBERSHOP_ID } from "../types/database";

/**
 * Serviço de Bloqueio de Horários e Feriados/Indisponibilidades
 * Preparado para substituir por: supabase.from('blocked_times')
 */
export const blockedTimeService = {
  async getAll() {
    const list = storage.get(STORAGE_KEYS.BLOCKED_TIMES, []);
    return list.sort((a, b) => (a.date > b.date ? 1 : -1));
  },

  async getByDate(dateStr) {
    const list = await this.getAll();
    return list.filter((b) => b.date === dateStr);
  },

  async create(blockedData) {
    const list = storage.get(STORAGE_KEYS.BLOCKED_TIMES, []);
    const newBlock = {
      id: "blk-" + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now()),
      barbershop_id: blockedData.barbershop_id || DEFAULT_BARBERSHOP_ID,
      barber_id: blockedData.barber_id || null, // null significa bloqueio para todos
      date: blockedData.date,
      is_full_day: Boolean(blockedData.is_full_day),
      start_time: blockedData.is_full_day ? null : blockedData.start_time,
      end_time: blockedData.is_full_day ? null : blockedData.end_time,
      reason: blockedData.reason ? blockedData.reason.trim() : "Indisponível",
      created_at: new Date().toISOString(),
    };
    list.push(newBlock);
    storage.set(STORAGE_KEYS.BLOCKED_TIMES, list);
    return newBlock;
  },

  async delete(id) {
    const list = storage.get(STORAGE_KEYS.BLOCKED_TIMES, []);
    const filtered = list.filter((b) => b.id !== id);
    storage.set(STORAGE_KEYS.BLOCKED_TIMES, filtered);
    return true;
  },
};
