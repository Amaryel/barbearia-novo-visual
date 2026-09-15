import { storage, STORAGE_KEYS } from "./storage";

/**
 * Serviço de gerenciamento dos Horários de Funcionamento
 * Preparado para substituir por: supabase.from('business_hours')
 */
export const businessHoursService = {
  async getAll() {
    const list = storage.get(STORAGE_KEYS.BUSINESS_HOURS, []);
    return list.sort((a, b) => a.day_of_week - b.day_of_week);
  },

  async getByDayOfWeek(dayOfWeek) {
    const list = await this.getAll();
    return list.find((bh) => bh.day_of_week === dayOfWeek) || null;
  },

  async updateAll(updatedHours) {
    storage.set(STORAGE_KEYS.BUSINESS_HOURS, updatedHours);
    return updatedHours;
  },

  async updateDay(dayOfWeek, dayConfig) {
    const list = await this.getAll();
    const index = list.findIndex((bh) => bh.day_of_week === dayOfWeek);
    if (index === -1) throw new Error("Dia não encontrado");

    list[index] = { ...list[index], ...dayConfig };
    storage.set(STORAGE_KEYS.BUSINESS_HOURS, list);
    return list[index];
  },
};
