import { useState, useEffect, useMemo } from "react";
import { serviceService } from "../services/serviceService";
import { availabilityService } from "../services/availabilityService";
import {
  appointmentService,
  buildClientWhatsappLink,
  buildClientCancelWhatsappLink,
  formatDateBR,
} from "../services/appointmentService";
import { storage } from "../services/storage";
import {
  Check,
  Calendar,
  Clock,
  Scissors,
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  AlertCircle,
  Plus,
  Trash2,
  CalendarDays,
  Search,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import "./BookingFlow.css";

const STEPS = [
  { id: 1, title: "Serviço", shortLabel: "Serviços", desc: "Escolha o que deseja fazer", icon: Scissors },
  { id: 2, title: "Dia e Hora", shortLabel: "Dia e Hora", desc: "Escolha o melhor momento", icon: Calendar },
  { id: 3, title: "Seus Dados", shortLabel: "Seus Dados", desc: "Nome e WhatsApp", icon: Phone },
  { id: 4, title: "Confirmação", shortLabel: "Finalizar", desc: "Revise e confirme", icon: Check },
];

function getIsoDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Gera os próximos 7 dias úteis para seleção rápida e amigável (ideal para idosos)
function getQuickDays() {
  const days = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date();
    nextDate.setDate(now.getDate() + i);
    const dayOfWeek = nextDate.getDay();
    const iso = getIsoDate(nextDate);

    let prefix = "";
    if (i === 0) prefix = "Hoje";
    else if (i === 1) prefix = "Amanhã";
    else {
      const weekdayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      prefix = weekdayNames[dayOfWeek];
    }

    const dayMonth = `${String(nextDate.getDate()).padStart(2, "0")}/${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

    days.push({
      iso,
      prefix,
      dayMonth,
      dayOfWeek,
      isSunday: dayOfWeek === 0,
    });
  }
  return days;
}

export default function BookingFlow({ onCompleted, initialServiceId = "", onClose = null }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seleção de múltiplos serviços (inicia vazio por padrão para escolha livre do cliente)
  const [selectedServiceIds, setSelectedServiceIds] = useState(() => {
    return initialServiceId ? [initialServiceId] : [];
  });

  // Data & Horário
  const quickDaysList = useMemo(() => getQuickDays(), []);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Escolhe hoje se não for domingo, ou amanhã se for domingo
    const days = getQuickDays();
    return days[0].isSunday ? days[1].iso : days[0].iso;
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [availability, setAvailability] = useState({ isOpen: true, slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Dados do Cliente
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Estados de Envio & Confirmação
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Modo de Consulta de Agendamento do Cliente (para cancelar ou verificar)
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");

  // Carrega serviços
  useEffect(() => {
    let isCurrent = true;
    async function loadData() {
      try {
        const srvs = await serviceService.getActive();
        if (!isCurrent) return;
        setServices(srvs);
        if (initialServiceId) {
          setSelectedServiceIds([initialServiceId]);
        }
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    loadData();

    const unsubscribe = storage.subscribe(() => {
      loadData();
    });
    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [initialServiceId]);

  // Lista dos objetos de serviços selecionados
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);
  }, [selectedServices]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  }, [selectedServices]);

  const combinedServiceName = useMemo(() => {
    if (selectedServices.length === 0) return "";
    return selectedServices.map((s) => s.name).join(" + ");
  }, [selectedServices]);

  // Função utilitária para rolar suavemente até o elemento desejado
  function scrollToElement(target, offset = 16) {
    if (!target) return;
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;

    // Se estiver dentro de um modal com scroll próprio
    const modalBody = el.closest(".booking-modal-body") || document.querySelector(".booking-modal-body");
    if (modalBody && modalBody.contains(el)) {
      const bodyRect = modalBody.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetScrollTop = modalBody.scrollTop + (elRect.top - bodyRect.top) - offset;
      modalBody.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
      return;
    }

    // Se estiver na página direta
    const headerOffset = 80;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - offset;
    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: "smooth",
    });
  }

  // Foca automaticamente no campo de nome quando o usuário avança para o Passo 3
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        const nameInput = document.getElementById("customer-name-input");
        if (nameInput) {
          nameInput.focus({ preventScroll: true });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Rola para o comprovante de sucesso quando o agendamento for concluído
  useEffect(() => {
    if (confirmedBooking) {
      const timer = setTimeout(() => {
        scrollToElement("#booking-success-view", 16);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [confirmedBooking]);

  // Serviços sugeridos que ainda não foram selecionados (para combos fáceis com 1 clique)
  const availableUpsells = useMemo(() => {
    return services.filter((s) => !selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  // Toggle serviço (permite marcar e desmarcar qualquer serviço livremente)
  function handleToggleService(serviceId) {
    setSelectedServiceIds((prev) => {
      const willBeSelected = !prev.includes(serviceId);
      const nextList = willBeSelected ? [...prev, serviceId] : prev.filter((id) => id !== serviceId);

      if (willBeSelected) {
        // Rola direto para o botão de continuar / resumo para evitar rolagem manual
        setTimeout(() => {
          scrollToElement("#booking-step1-summary", 24);
        }, 120);
      }
      return nextList;
    });
    setErrors({});
  }

  function handleAddService(serviceId) {
    if (!selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds((prev) => [...prev, serviceId]);
      setTimeout(() => {
        scrollToElement("#booking-step1-summary", 24);
      }, 120);
    }
  }

  // Seleção de dia
  function handleSelectDay(dayIso) {
    setShowCustomDatePicker(false);
    setSelectedDate(dayIso);
    setSelectedTime("");
    setErrors({});
    // Rola direto para a lista de horários livres disponíveis
    setTimeout(() => {
      scrollToElement("#booking-slots-container", 20);
    }, 120);
  }

  // Seleção de horário
  function handleSelectTime(timeSlot) {
    setSelectedTime(timeSlot);
    setErrors({});
    // Rola direto para o botão de continuar para o próximo passo
    setTimeout(() => {
      scrollToElement("#booking-footer-nav", 24);
    }, 120);
  }

  // Carrega horários disponíveis quando a data ou os serviços mudam
  useEffect(() => {
    let isCurrent = true;
    async function fetchSlots() {
      if (!selectedDate || selectedServiceIds.length === 0) return;
      setLoadingSlots(true);
      try {
        const res = await availabilityService.getAvailableSlots(
          selectedDate,
          selectedServiceIds,
          "barb-leandro",
          totalDuration
        );
        if (isCurrent) {
          setAvailability(res);
          setSelectedTime((prevTime) =>
            prevTime && !res.slots.some((s) => s.time === prevTime) ? "" : prevTime
          );
        }
      } catch (err) {
        console.error("Erro ao calcular slots:", err);
      } finally {
        if (isCurrent) setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => {
      isCurrent = false;
    };
  }, [selectedDate, selectedServiceIds, totalDuration]);

  // Separação dos horários em Manhã e Tarde para maior legibilidade
  const morningSlots = useMemo(() => {
    return availability.slots.filter((s) => s.time < "12:00");
  }, [availability.slots]);

  const afternoonSlots = useMemo(() => {
    return availability.slots.filter((s) => s.time >= "12:00");
  }, [availability.slots]);

  // Formatação automática simples de telefone para evitar erros
  function handlePhoneChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }
    setCustomerPhone(formatted);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  }

  // Validação por etapa
  function validateCurrentStep() {
    const errs = {};
    if (step === 1) {
      if (selectedServiceIds.length === 0) {
        errs.service = "Por favor, toque em pelo menos um serviço para continuar.";
      }
    } else if (step === 2) {
      if (!selectedDate) errs.date = "Por favor, escolha um dia para o atendimento.";
      if (!selectedTime) errs.time = "Por favor, toque em um dos horários disponíveis abaixo para continuar.";
    } else if (step === 3) {
      if (!customerName.trim()) errs.name = "Por favor, digite seu nome.";
      const digits = customerPhone.replace(/\D/g, "");
      if (digits.length < 10) {
        errs.phone = "Por favor, informe seu número de WhatsApp com DDD (ex: 89 99999-9999).";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 4));
    // Scroll suave para o topo do fluxo
    const container = document.querySelector(".booking-modal-body") || window;
    if (container.scrollTo) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleConfirm() {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    try {
      const newApt = await appointmentService.create({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        service_id: selectedServiceIds.join(","),
        service_name: combinedServiceName,
        service_price: totalPrice,
        duration_minutes: totalDuration,
        barber_id: "barb-leandro",
        barber_name: "Leandro",
        date: selectedDate,
        start_time: selectedTime,
        status: "confirmed",
        notes: customerNotes,
      });

      setConfirmedBooking(newApt);
      if (onCompleted) onCompleted(newApt);
    } catch (err) {
      console.error("Erro ao confirmar agendamento:", err);
      setErrors({ submit: "Não foi possível registrar seu agendamento. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStep(1);
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerNotes("");
    setConfirmedBooking(null);
    setErrors({});
  }

  // Consulta e cancelamento de agendamento por telefone
  async function handleSearchCustomerAppointments(e) {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    setLookupLoading(true);
    setCancelFeedback("");
    try {
      const list = await appointmentService.getByPhone(lookupPhone);
      setLookupResults(list);
    } catch (err) {
      console.error("Erro ao consultar agendamentos:", err);
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleCancelAppointment(apt) {
    if (window.confirm(`Deseja realmente cancelar o agendamento de ${apt.service_name} no dia ${formatDateBR(apt.date)} às ${apt.start_time}?`)) {
      try {
        await appointmentService.cancelByCustomer(apt.id);
        setCancelFeedback("Seu agendamento foi cancelado com sucesso no sistema.");
        const list = await appointmentService.getByPhone(lookupPhone);
        setLookupResults(list);
      } catch (err) {
        console.error("Erro ao cancelar:", err);
      }
    }
  }

  // TELA DE SUCESSO / COMPROVANTE
  if (confirmedBooking) {
    const whatsappLink = buildClientWhatsappLink(confirmedBooking);
    const cancelWaLink = buildClientCancelWhatsappLink(confirmedBooking);

    return (
      <div className="booking-flow__success" id="booking-success-view">
        <div className="booking-flow__success-badge">
          <Check size={44} />
        </div>
        <p className="kicker">Agendamento Realizado com Sucesso!</p>
        <h2 className="booking-flow__success-title">
          Tudo certo, {confirmedBooking.customer_name.split(" ")[0]}!
        </h2>
        <p className="booking-flow__success-lead">
          Seu horário com o <strong>Barbeiro Leandro</strong> está confirmado em nosso sistema!
        </p>

        <div className="booking-flow__receipt">
          <div className="booking-flow__receipt-row">
            <span>Cliente</span>
            <strong>{confirmedBooking.customer_name}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Serviço(s)</span>
            <strong>{confirmedBooking.service_name}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Valor a pagar no local</span>
            <strong className="booking-flow__receipt-price">R$ {confirmedBooking.service_price}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Barbeiro</span>
            <strong>Leandro</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Dia</span>
            <strong>{formatDateBR(confirmedBooking.date)}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Horário Marcado</span>
            <strong className="booking-flow__receipt-time">
              {confirmedBooking.start_time} às {confirmedBooking.end_time}
            </strong>
          </div>
        </div>

        {/* Botão de Enviar WhatsApp */}
        <div className="booking-flow__success-actions">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary booking-flow__wa-btn"
          >
            <MessageCircle size={24} />
            <span>Enviar Confirmação no WhatsApp do Leandro</span>
          </a>

          {/* Tutorial e Instruções para Cancelamento / Remarcação */}
          <div className="booking-flow__cancel-guide">
            <div className="booking-flow__cancel-guide-header">
              <AlertCircle size={22} />
              <h4>Precisa cancelar ou mudar o horário?</h4>
            </div>
            <p>
              Se acontecer qualquer imprevisto, você não precisa se preocupar:
            </p>
            <ul>
              <li>
                <strong>Opção 1:</strong> Toque no link abaixo para avisar o Leandro no WhatsApp com 1 toque.
              </li>
              <li>
                <strong>Opção 2:</strong> Acesse este site a qualquer momento e clique em <em>"Já tem horário? Consultar"</em>.
              </li>
            </ul>

            <a
              href={cancelWaLink}
              target="_blank"
              rel="noreferrer"
              className="booking-flow__cancel-wa-link"
            >
              <MessageCircle size={18} />
              Avisar sobre cancelamento ou remarcação no WhatsApp
            </a>
          </div>

          <div className="booking-flow__secondary-btns">
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              Agendar outro horário
            </button>
            {onClose && (
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="booking-flow__loading">
        <div className="booking-flow__spinner" />
        <p>Carregando serviços da barbearia...</p>
      </div>
    );
  }

  const currentStepData = STEPS[step - 1];
  const progressPercent = (step / STEPS.length) * 100;

  const isStepValid =
    (step === 1 && selectedServiceIds.length > 0) ||
    (step === 2 && selectedDate && selectedTime && availability.isOpen && availability.slots.length > 0) ||
    (step === 3 && customerName.trim() && customerPhone.replace(/\D/g, "").length >= 10) ||
    step === 4;

  return (
    <div className="booking-flow">
      {/* Barra superior de status & consulta */}
      <div className="booking-flow__top-bar">
        <div className="booking-flow__barber-badge">
          <span className="booking-flow__barber-dot" />
          <span>Atendimento com o <strong>Barbeiro Leandro</strong></span>
        </div>

        <button
          type="button"
          onClick={() => setShowLookupModal(true)}
          className="booking-flow__lookup-trigger"
          aria-label="Consultar agendamentos anteriores"
        >
          <Search size={15} />
          <span>Já tem horário? Consultar</span>
        </button>
      </div>

      {/* Barra de Progresso Clara para Idosos e Mobile */}
      <div className="booking-flow__progress-card">
        <div className="booking-flow__progress-meta">
          <div className="booking-flow__progress-step-tag">
            <span>Passo {step} de 4</span>
          </div>
          <h3 className="booking-flow__progress-title">{currentStepData.title}</h3>
          <span className="booking-flow__progress-desc">{currentStepData.desc}</span>
        </div>

        {/* Linha visual de progresso */}
        <div className="booking-flow__progress-track" aria-hidden="true">
          <div
            className="booking-flow__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Indicadores de passos clicáveis */}
        <nav className="booking-flow__steps-nav" aria-label="Navegação de passos">
          <ol className="booking-flow__step-indicators">
            {STEPS.map((s) => {
              const isDone = s.id < step;
              const isActive = s.id === step;
              const isClickable = s.id < step;
              return (
                <li
                  key={s.id}
                  className={`booking-flow__step-item ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => isClickable && setStep(s.id)}
                    disabled={!isClickable}
                    className="booking-flow__step-btn"
                    title={isClickable ? `Voltar para o passo ${s.id}` : `Passo ${s.id}: ${s.shortLabel}`}
                  >
                    <span className="booking-flow__step-circle">
                      {isDone ? <Check size={18} /> : s.id}
                    </span>
                    <span className="booking-flow__step-label">{s.shortLabel}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="booking-flow__body">
        {/* ============================================================ */}
        {/* PASSO 1: ESCOLHER SERVIÇOS */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="booking-flow__section" id="booking-step-1">
            <div className="booking-flow__step-instruction">
              <span className="booking-flow__instruction-badge">Instrução fácil</span>
              <h4>Toque no serviço que você deseja agendar:</h4>
              <p>Você pode tocar em mais de um serviço se quiser fazer barba, sobrancelha ou outros cuidados juntos.</p>
            </div>

            <div className="booking-flow__service-list">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <button
                    type="button"
                    key={srv.id}
                    className={`booking-flow__service-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleToggleService(srv.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="booking-flow__radio-check">
                      <div className={`booking-flow__check-box ${isSelected ? "is-checked" : ""}`}>
                        {isSelected && <Check size={18} />}
                      </div>
                    </div>

                    <div className="booking-flow__service-info">
                      <div className="booking-flow__service-title-row">
                        <h4>{srv.name}</h4>
                        <span className="booking-flow__service-price">R$ {srv.price}</span>
                      </div>
                      {srv.description && (
                        <p className="booking-flow__service-desc">{srv.description}</p>
                      )}
                      <div className="booking-flow__service-meta">
                        <Clock size={16} />
                        <span>Duração: cerca de {srv.duration_minutes} minutos</span>
                        {isSelected && (
                          <span className="booking-flow__selected-tag">
                            <Check size={13} /> Selecionado
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sugestões de adicionais com 1 toque */}
            {selectedServiceIds.length > 0 && availableUpsells.length > 0 && (
              <div className="booking-flow__upsell-card">
                <div className="booking-flow__upsell-head">
                  <Sparkles size={20} />
                  <span>Deseja adicionar mais algum serviço ao seu corte?</span>
                </div>
                <div className="booking-flow__upsell-buttons">
                  {availableUpsells.map((extra) => (
                    <button
                      type="button"
                      key={extra.id}
                      onClick={() => handleAddService(extra.id)}
                      className="booking-flow__upsell-btn"
                    >
                      <Plus size={16} />
                      <span>{extra.name} (+R$ {extra.price})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo da Seleção com Botão de Avanço Imediato */}
            {selectedServiceIds.length > 0 ? (
              <div className="booking-flow__summary-callout" id="booking-step1-summary">
                <div className="booking-flow__summary-callout-info">
                  <span className="booking-flow__summary-callout-count">
                    ✓ {selectedServices.length} {selectedServices.length === 1 ? "serviço selecionado" : "serviços selecionados"}:
                  </span>
                  <strong>{combinedServiceName}</strong>
                  <span className="booking-flow__summary-callout-totals">
                    Valor: <strong>R$ {totalPrice}</strong> · Tempo total: <strong>{totalDuration} min</strong>
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary booking-flow__callout-btn"
                  onClick={handleNext}
                >
                  <span>Continuar para o Horário</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="booking-flow__empty-selection-hint">
                <p>Selecione um corte ou serviço acima para habilitar o botão de continuar.</p>
              </div>
            )}

            {errors.service && <p className="booking-flow__error-msg">{errors.service}</p>}
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 2: DIA E HORÁRIO JUNTOS */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="booking-flow__section" id="booking-step-2">
            <div className="booking-flow__step-instruction">
              <span className="booking-flow__instruction-badge">Instrução fácil</span>
              <h4>1º Escolha o dia e 2º Toque no horário livre:</h4>
              <p>
                Serviço escolhido: <strong>{combinedServiceName}</strong> (Duração: {totalDuration} min)
              </p>
            </div>

            {/* Seletor Rápido de Dias */}
            <div className="booking-flow__quick-days-container" id="booking-step2-days">
              <label className="booking-flow__field-label">
                Toque no dia que você prefere vir:
              </label>

              <div className="booking-flow__quick-days-grid">
                {quickDaysList.map((day) => {
                  const isSelected = selectedDate === day.iso && !showCustomDatePicker;
                  return (
                    <button
                      type="button"
                      key={day.iso}
                      className={`booking-flow__quick-day-btn ${isSelected ? "is-selected" : ""} ${day.isSunday ? "is-closed" : ""}`}
                      onClick={() => handleSelectDay(day.iso)}
                      disabled={day.isSunday}
                      title={day.isSunday ? "Fechado aos Domingos" : `Selecionar ${day.prefix}`}
                    >
                      <span className="booking-flow__quick-day-prefix">{day.prefix}</span>
                      <strong className="booking-flow__quick-day-date">{day.dayMonth}</strong>
                      {day.isSunday ? (
                        <span className="booking-flow__quick-day-closed">Fechado</span>
                      ) : (
                        <span className="booking-flow__quick-day-status">Disponível</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Opção para outra data no calendário manual */}
              <div className="booking-flow__custom-date-row">
                <button
                  type="button"
                  onClick={() => setShowCustomDatePicker((v) => !v)}
                  className="booking-flow__text-link-btn"
                >
                  <CalendarDays size={18} />
                  <span>{showCustomDatePicker ? "Fechar calendário manual" : "Prefere escolher outra data mais para frente?"}</span>
                </button>

                {showCustomDatePicker && (
                  <div className="booking-flow__custom-date-input-wrap">
                    <label className="booking-flow__sub-label">Escolha a data no calendário:</label>
                    <input
                      type="date"
                      min={getIsoDate(new Date())}
                      value={selectedDate}
                      onChange={(e) => handleSelectDay(e.target.value)}
                      className="booking-flow__date-input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Visualização de Horários Disponíveis do Dia Selecionado */}
            <div className="booking-flow__slots-container" id="booking-slots-container">
              <div className="booking-flow__slots-head">
                <Clock size={20} />
                <h4>Horários livres para {formatDateBR(selectedDate)}:</h4>
              </div>

              {loadingSlots ? (
                <div className="booking-flow__loading-slots">
                  <div className="booking-flow__spinner" />
                  <p>Buscando horários disponíveis com o Leandro...</p>
                </div>
              ) : !availability.isOpen ? (
                <div className="booking-flow__alert-banner">
                  <AlertCircle size={26} />
                  <div>
                    <strong>Barbearia Fechada nesta data</strong>
                    <p>{availability.reason || "Não haverá atendimento neste dia."}</p>
                  </div>
                </div>
              ) : availability.slots.length === 0 ? (
                <div className="booking-flow__empty-slots">
                  <AlertCircle size={32} />
                  <h4>Todos os horários deste dia já foram preenchidos</h4>
                  <p>Por favor, toque em outro dia nos botões acima para ver outros horários disponíveis.</p>
                </div>
              ) : (
                <div className="booking-flow__slots-groups">
                  {/* Banner de horário selecionado */}
                  {selectedTime && (
                    <div className="booking-flow__selected-time-banner">
                      <Check size={20} />
                      <span>
                        Horário escolhido: <strong>{formatDateBR(selectedDate)} às {selectedTime}</strong>
                      </span>
                    </div>
                  )}

                  {/* Manhã */}
                  {morningSlots.length > 0 && (
                    <div className="booking-flow__time-group">
                      <h5 className="booking-flow__time-group-title">🌅 Manhã (8h às 12h)</h5>
                      <div className="booking-flow__slots-grid">
                        {morningSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              type="button"
                              key={slot.time}
                              className={`booking-flow__slot-btn ${isSelected ? "is-selected" : ""}`}
                              onClick={() => handleSelectTime(slot.time)}
                            >
                              <strong className="booking-flow__slot-time">{slot.time}</strong>
                              <span className="booking-flow__slot-sub">até {slot.endTime}</span>
                              {isSelected && <Check size={18} className="booking-flow__slot-check" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tarde */}
                  {afternoonSlots.length > 0 && (
                    <div className="booking-flow__time-group">
                      <h5 className="booking-flow__time-group-title">☀️ Tarde (12h às 19h)</h5>
                      <div className="booking-flow__slots-grid">
                        {afternoonSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              type="button"
                              key={slot.time}
                              className={`booking-flow__slot-btn ${isSelected ? "is-selected" : ""}`}
                              onClick={() => handleSelectTime(slot.time)}
                            >
                              <strong className="booking-flow__slot-time">{slot.time}</strong>
                              <span className="booking-flow__slot-sub">até {slot.endTime}</span>
                              {isSelected && <Check size={18} className="booking-flow__slot-check" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {errors.date && <p className="booking-flow__error-msg">{errors.date}</p>}
              {errors.time && <p className="booking-flow__error-msg">{errors.time}</p>}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 3: SEUS DADOS */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="booking-flow__section" id="booking-step-3">
            <div className="booking-flow__step-instruction">
              <span className="booking-flow__instruction-badge">Instrução fácil</span>
              <h4>Preencha seu nome e o número do seu WhatsApp:</h4>
              <p>Usaremos seu WhatsApp para enviar o lembrete do horário para você não esquecer.</p>
            </div>

            <div className="booking-flow__form-group" id="booking-step3-form">
              <div className="booking-flow__input-field">
                <label htmlFor="customer-name-input">
                  Seu Nome Completo <span className="booking-flow__req">*</span>
                </label>
                <input
                  id="customer-name-input"
                  type="text"
                  placeholder="Digite seu nome (Ex: João da Silva)"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className="booking-flow__text-input booking-flow__text-input--large"
                  autoComplete="name"
                  autoCapitalize="words"
                  required
                />
                {errors.name && <p className="booking-flow__error-msg">{errors.name}</p>}
              </div>

              <div className="booking-flow__input-field">
                <label htmlFor="customer-phone-input">
                  Seu Celular / WhatsApp com DDD <span className="booking-flow__req">*</span>
                </label>
                <input
                  id="customer-phone-input"
                  type="tel"
                  inputMode="tel"
                  placeholder="(89) 9 9999-9999"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  className="booking-flow__text-input booking-flow__text-input--large"
                  autoComplete="tel"
                  required
                />
                <span className="booking-flow__input-hint">
                  ✓ Digite com DDD (Exemplo: 89 99999-9999).
                </span>
                {errors.phone && <p className="booking-flow__error-msg">{errors.phone}</p>}
              </div>

              <div className="booking-flow__input-field">
                <label htmlFor="customer-notes-input">Alguma observação ou preferência? (Opcional)</label>
                <textarea
                  id="customer-notes-input"
                  placeholder="Ex: Primeira vez na barbearia, prefiro cortar na tesoura..."
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="booking-flow__text-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PASSO 4: CONFIRMAÇÃO & RESUMO */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="booking-flow__section" id="booking-step-4">
            <div className="booking-flow__step-instruction">
              <span className="booking-flow__instruction-badge">Instrução fácil</span>
              <h4>Revise seus dados com calma antes de confirmar:</h4>
              <p>Confira o serviço, o dia e o horário marcados com o Leandro.</p>
            </div>

            <div className="booking-flow__review-card" id="booking-step4-review">
              <div className="booking-flow__review-item">
                <Scissors size={26} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Serviço Escolhido</span>
                  <strong className="booking-flow__review-value">{combinedServiceName}</strong>
                  <span className="booking-flow__review-sub">
                    Total: R$ {totalPrice} · Duração estimada: {totalDuration} min
                  </span>
                </div>
              </div>

              <div className="booking-flow__review-item">
                <User size={26} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Profissional</span>
                  <strong className="booking-flow__review-value">Barbeiro Leandro</strong>
                  <span className="booking-flow__review-sub">Atendimento dedicado</span>
                </div>
              </div>

              <div className="booking-flow__review-item">
                <Calendar size={26} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Data e Horário</span>
                  <strong className="booking-flow__review-value">
                    {formatDateBR(selectedDate)} às {selectedTime}
                  </strong>
                </div>
              </div>

              <div className="booking-flow__review-item">
                <Phone size={26} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Seus Dados de Contato</span>
                  <strong className="booking-flow__review-value">{customerName}</strong>
                  <span className="booking-flow__review-sub">{customerPhone}</span>
                </div>
              </div>

              {customerNotes && (
                <div className="booking-flow__review-item">
                  <div className="booking-flow__review-notes">
                    <span className="booking-flow__review-label">Observação</span>
                    <p className="booking-flow__review-notes-text">{customerNotes}</p>
                  </div>
                </div>
              )}

              {/* Mensagem de segurança e tranquilidade para o cliente */}
              <div className="booking-flow__peace-of-mind">
                <ShieldCheck size={22} />
                <span>
                  <strong>Sem cobrança antecipada:</strong> O pagamento é feito diretamente na barbearia no dia do seu corte (Dinheiro, PIX ou Cartão).
                </span>
              </div>
            </div>

            {errors.submit && <p className="booking-flow__error-msg">{errors.submit}</p>}
          </div>
        )}
      </div>

      {/* RODAPÉ DE NAVEGAÇÃO ENTRE PASSOS (Adaptado para Desktop & Mobile) */}
      <div className="booking-flow__footer" id="booking-footer-nav">
        {step > 1 ? (
          <button
            type="button"
            className="btn btn-outline booking-flow__back-btn"
            onClick={handleBack}
            disabled={submitting}
          >
            <ArrowLeft size={20} />
            <span>Voltar passo</span>
          </button>
        ) : (
          <div className="booking-flow__footer-placeholder" />
        )}

        {step < 4 ? (
          <button
            type="button"
            className="btn btn-primary booking-flow__next-btn"
            onClick={handleNext}
            disabled={!isStepValid}
          >
            <span>
              {step === 1
                ? "Continuar para o Horário"
                : step === 2
                ? "Continuar para Meus Dados"
                : "Continuar para Revisão"}
            </span>
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary booking-flow__confirm-btn"
            onClick={handleConfirm}
            disabled={submitting}
          >
            <Check size={22} />
            <span>{submitting ? "Confirmando..." : "Confirmar Agendamento"}</span>
          </button>
        )}
      </div>

      {/* BARRA FIXA FLUTUANTE EM DISPOSITIVOS MÓVEIS (Acelera o avanço sem precisar rolar a tela) */}
      {isStepValid && !confirmedBooking && step < 4 && (
        <div className="booking-flow__mobile-sticky-bar" id="booking-mobile-sticky-bar">
          <div className="booking-flow__mobile-sticky-info">
            <span className="booking-flow__mobile-sticky-step">Passo {step} de 4 pronto</span>
            <strong className="booking-flow__mobile-sticky-label">
              {step === 1
                ? `${selectedServices.length} serviço(s) · R$ ${totalPrice}`
                : step === 2
                ? `${formatDateBR(selectedDate)} às ${selectedTime}`
                : `${customerName || "Dados informados"}`}
            </strong>
          </div>
          <button
            type="button"
            className="booking-flow__mobile-sticky-btn"
            onClick={handleNext}
          >
            <span>Avançar</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL DE CONSULTA / CANCELAMENTO */}
      {showLookupModal && (
        <div
          className="booking-flow__modal-overlay"
          onClick={() => setShowLookupModal(false)}
          data-lenis-prevent="true"
        >
          <div
            className="booking-flow__lookup-card"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div className="booking-flow__lookup-header">
              <h3>Consultar seus Agendamentos</h3>
              <button
                type="button"
                className="booking-flow__lookup-close"
                onClick={() => setShowLookupModal(false)}
                aria-label="Fechar janela"
              >
                ✕
              </button>
            </div>

            <p className="booking-flow__lookup-lead">
              Digite seu número de WhatsApp para ver seus horários marcados:
            </p>

            <form onSubmit={handleSearchCustomerAppointments} className="booking-flow__lookup-form">
              <input
                type="tel"
                inputMode="tel"
                placeholder="Ex: (89) 9 9999-9999"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="booking-flow__text-input"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={lookupLoading}>
                {lookupLoading ? "Buscando..." : "Buscar"}
              </button>
            </form>

            {cancelFeedback && (
              <div className="booking-flow__cancel-feedback">
                <Check size={18} />
                <span>{cancelFeedback}</span>
              </div>
            )}

            {lookupResults !== null && (
              <div className="booking-flow__lookup-results">
                {lookupResults.length === 0 ? (
                  <p className="booking-flow__lookup-empty">
                    Nenhum agendamento encontrado para este número.
                  </p>
                ) : (
                  <div className="booking-flow__lookup-list">
                    {lookupResults.map((apt) => (
                      <div key={apt.id} className={`booking-flow__lookup-item status-${apt.status}`}>
                        <div className="booking-flow__lookup-item-main">
                          <strong>{apt.service_name}</strong>
                          <span>
                            {formatDateBR(apt.date)} às {apt.start_time} · Barbeiro Leandro
                          </span>
                          <span className={`booking-flow__lookup-status status-${apt.status}`}>
                            Status: {apt.status === "confirmed" ? "Confirmado" : apt.status === "cancelled" ? "Cancelado" : "Concluído"}
                          </span>
                        </div>

                        {apt.status === "confirmed" && (
                          <div className="booking-flow__lookup-actions">
                            <a
                              href={buildClientCancelWhatsappLink(apt)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline booking-flow__lookup-wa-btn"
                              title="Avisar no WhatsApp"
                            >
                              <MessageCircle size={16} />
                              Avisar no WhatsApp
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCancelAppointment(apt)}
                              className="booking-flow__lookup-cancel-btn"
                              title="Cancelar agendamento"
                            >
                              <Trash2 size={16} />
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
