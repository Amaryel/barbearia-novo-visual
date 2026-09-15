/**
 * Contrato e Schema dos Modelos de Dados
 * Preparado para futura migração para Supabase / PostgreSQL.
 * Todos os modelos contêm `barbershop_id` para suporte nativo a multiempresa.
 */

export const DEFAULT_BARBERSHOP_ID = "barbershop_novo_visual_01";

/**
 * @typedef {Object} Barbershop
 * @property {string} id - UUID ou slug único
 * @property {string} name - Nome da barbearia
 * @property {string} slug - Slug para URL
 * @property {string} phone - Telefone para exibição
 * @property {string} whatsapp - Número internacional para wa.me
 * @property {string} address - Endereço completo
 * @property {string} city - Cidade/UF
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {Object} Service
 * @property {string} id - UUID do serviço
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {string} name - Nome do serviço (ex: Corte clássico)
 * @property {string} description - Descrição detalhada
 * @property {number} price - Preço em reais (ex: 45.00)
 * @property {number} duration_minutes - Duração do atendimento em minutos (ex: 40)
 * @property {boolean} is_active - Se o serviço está ativo para agendamento
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {Object} Barber
 * @property {string} id - UUID do barbeiro
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {string} name - Nome completo do profissional
 * @property {string} phone - Telefone / WhatsApp do profissional
 * @property {string} specialties - Especialidades / descrição
 * @property {string} avatar_url - URL da foto do profissional
 * @property {boolean} is_active - Se o profissional está na escala ativa
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {Object} Customer
 * @property {string} id - UUID do cliente
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {string} name - Nome completo
 * @property {string} phone - Telefone / WhatsApp formatado
 * @property {string} [email] - E-mail opcional
 * @property {string} [notes] - Observações sobre preferências
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {'pending' | 'confirmed' | 'completed' | 'cancelled'} AppointmentStatus
 * 
 * @typedef {Object} Appointment
 * @property {string} id - UUID do agendamento
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {string} customer_id - UUID ou ID temporário do cliente
 * @property {string} customer_name - Nome do cliente
 * @property {string} customer_phone - Telefone do cliente
 * @property {string} service_id - ID do serviço escolhido
 * @property {string} service_name - Nome do serviço
 * @property {number} service_price - Preço do serviço
 * @property {number} duration_minutes - Duração em minutos
 * @property {string} barber_id - ID do barbeiro ("qualquer" ou ID específico)
 * @property {string} barber_name - Nome do barbeiro
 * @property {string} date - Data no formato YYYY-MM-DD
 * @property {string} start_time - Horário de início HH:MM
 * @property {string} end_time - Horário previsto de término HH:MM
 * @property {AppointmentStatus} status - Status do agendamento
 * @property {string} [notes] - Observações do cliente ou admin
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {Object} BusinessHours
 * @property {string} id - UUID
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {number} day_of_week - 0 (Domingo) a 6 (Sábado)
 * @property {string} day_name - Nome do dia (ex: Segunda-feira)
 * @property {boolean} is_open - Aberto ou fechado
 * @property {string} open_time - Horário de abertura HH:MM (ex: 08:00)
 * @property {string} close_time - Horário de fechamento HH:MM (ex: 19:00)
 * @property {string | null} break_start - Início do intervalo HH:MM (ex: 12:00)
 * @property {string | null} break_end - Fim do intervalo HH:MM (ex: 13:00)
 */

/**
 * @typedef {Object} BlockedTime
 * @property {string} id - UUID do bloqueio
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {string | null} barber_id - ID do barbeiro específico ou null para todos
 * @property {string} date - Data no formato YYYY-MM-DD
 * @property {boolean} is_full_day - Se bloqueia o dia todo
 * @property {string} [start_time] - Horário de início do bloqueio HH:MM
 * @property {string} [end_time] - Horário de fim do bloqueio HH:MM
 * @property {string} reason - Motivo do bloqueio (ex: Manutenção, Feriado, Compromisso)
 * @property {string} created_at - ISO Date string
 */

/**
 * @typedef {Object} AdminUser
 * @property {string} id - UUID do usuário
 * @property {string} barbershop_id - Chave estrangeira da barbearia
 * @property {string} email - E-mail de login
 * @property {string} name - Nome do administrador / operador
 * @property {string} role - 'admin' | 'barber' | 'receptionist'
 */
