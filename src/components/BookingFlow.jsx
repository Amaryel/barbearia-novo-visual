import { useState, useEffect, useMemo } from "react";
import { serviceService } from "../services/serviceService";
import { barberService } from "../services/barberService";
import { availabilityService } from "../services/availabilityService";
import { appointmentService, buildClientWhatsappLink, formatDateBR } from "../services/appointmentService";
import { storage } from "../services/storage";
import { Check, Calendar, Clock, Scissors, User, Phone, ArrowLeft, ArrowRight, MessageCircle, AlertCircle } from "lucide-react";
import "./BookingFlow.css";

const STEPS = [
  { id: 1, label: "Serviço", icon: Scissors },
  { id: 2, label: "Profissional", icon: User },
  { id: 3, label: "Data", icon: Calendar },
  { id: 4, label: "Horário", icon: Clock },
  { id: 5, label: "Seus dados", icon: Phone },
  { id: 6, label: "Confirmação", icon: Check },
];

function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BookingFlow({ onCompleted, initialServiceId = "", onClose = null }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedBarberId, setSelectedBarberId] = useState("qualquer");
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Availability State
  const [availability, setAvailability] = useState({ isOpen: true, slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Carregar serviços e barbeiros
  useEffect(() => {
    async function loadData() {
      try {
        const [srvs, barbs] = await Promise.all([
          serviceService.getAll(true),
          barberService.getAll(true),
        ]);
        setServices(srvs);
        setBarbers(barbs);
        if (initialServiceId) {
          setSelectedServiceId(initialServiceId);
        } else if (srvs.length > 0 && !selectedServiceId) {
          setSelectedServiceId(srvs[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const unsubscribe = storage.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, [initialServiceId]);

  // Carregar horários disponíveis quando a data, serviço ou barbeiro mudar
  useEffect(() => {
    let isCurrent = true;
    async function fetchSlots() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await availabilityService.getAvailableSlots(
          selectedDate,
          selectedServiceId,
          selectedBarberId
        );
        if (isCurrent) {
          setAvailability(res);
          // Se o horário selecionado antes não está mais disponível, limpa
          if (selectedTime && !res.slots.some((s) => s.time === selectedTime)) {
            setSelectedTime("");
          }
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
  }, [selectedDate, selectedServiceId, selectedBarberId]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const selectedBarber = useMemo(() => {
    if (selectedBarberId === "qualquer") {
      return { id: "qualquer", name: "Qualquer disponível" };
    }
    return barbers.find((b) => b.id === selectedBarberId) || { id: "qualquer", name: "Qualquer disponível" };
  }, [barbers, selectedBarberId]);

  // Validação por etapa
  function validateCurrentStep() {
    const errs = {};
    if (step === 1) {
      if (!selectedServiceId) errs.service = "Selecione um serviço para continuar.";
    } else if (step === 2) {
      if (!selectedBarberId) errs.barber = "Selecione um profissional.";
    } else if (step === 3) {
      if (!selectedDate) errs.date = "Selecione uma data.";
    } else if (step === 4) {
      if (!selectedTime) errs.time = "Selecione um horário disponível.";
    } else if (step === 5) {
      if (!customerName.trim()) errs.name = "Informe seu nome completo.";
      if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 8) {
        errs.phone = "Informe um WhatsApp ou telefone válido com DDD.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 6));
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleConfirm() {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    try {
      // Determina barbeiro real se "qualquer"
      let actualBarberId = selectedBarberId;
      let actualBarberName = selectedBarber.name;

      if (selectedBarberId === "qualquer") {
        const slotData = availability.slots.find((s) => s.time === selectedTime);
        if (slotData && slotData.freeBarbers && slotData.freeBarbers.length > 0) {
          actualBarberId = slotData.freeBarbers[0].id;
          actualBarberName = slotData.freeBarbers[0].name;
        }
      }

      const newApt = await appointmentService.create({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        service_id: selectedService.id,
        service_name: selectedService.name,
        service_price: selectedService.price,
        duration_minutes: selectedService.duration_minutes,
        barber_id: actualBarberId,
        barber_name: actualBarberName,
        date: selectedDate,
        start_time: selectedTime,
        status: "confirmed",
        notes: customerNotes,
      });

      setConfirmedBooking(newApt);
      if (onCompleted) onCompleted(newApt);
    } catch (err) {
      console.error("Erro ao confirmar agendamento:", err);
      setErrors({ submit: "Não foi possível registrar o agendamento. Tente novamente." });
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

  // Se já foi confirmado, exibe a tela de sucesso
  if (confirmedBooking) {
    const whatsappLink = buildClientWhatsappLink(confirmedBooking);
    return (
      <div className="booking-flow__success" id="booking-success-view">
        <div className="booking-flow__success-badge">
          <Check size={36} />
        </div>
        <p className="kicker">Agendamento Realizado com Sucesso!</p>
        <h2 className="booking-flow__success-title">
          Tudo pronto, {confirmedBooking.customer_name.split(" ")[0]}!
        </h2>
        <p className="booking-flow__success-lead">
          Seu horário está garantido em nosso sistema. Para maior comodidade, você também pode enviar a confirmação direta para o nosso WhatsApp.
        </p>

        <div className="booking-flow__receipt">
          <div className="booking-flow__receipt-row">
            <span>Cliente</span>
            <strong>{confirmedBooking.customer_name}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Serviço</span>
            <strong>{confirmedBooking.service_name} (R$ {confirmedBooking.service_price})</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Profissional</span>
            <strong>{confirmedBooking.barber_name}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Data</span>
            <strong>{formatDateBR(confirmedBooking.date)}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>Horário</span>
            <strong>{confirmedBooking.start_time} às {confirmedBooking.end_time}</strong>
          </div>
          <div className="booking-flow__receipt-row">
            <span>WhatsApp</span>
            <strong>{confirmedBooking.customer_phone}</strong>
          </div>
        </div>

        <div className="booking-flow__success-actions">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary booking-flow__wa-btn"
          >
            <MessageCircle size={18} />
            Enviar confirmação no WhatsApp
          </a>

          <div className="booking-flow__secondary-btns">
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              Fazer novo agendamento
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
        <p>Carregando serviços e profissionais...</p>
      </div>
    );
  }

  return (
    <div className="booking-flow">
      {/* Progress Bar / Steps indicator */}
      <nav className="booking-flow__steps-nav" aria-label="Progresso do agendamento">
        <ol className="booking-flow__step-indicators">
          {STEPS.map((s) => {
            const isDone = s.id < step;
            const isActive = s.id === step;
            return (
              <li
                key={s.id}
                className={`booking-flow__step-item ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  className="booking-flow__step-btn"
                >
                  <span className="booking-flow__step-circle">
                    {isDone ? <Check size={14} /> : s.id}
                  </span>
                  <span className="booking-flow__step-label">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Conteúdo dinâmico de cada etapa */}
      <div className="booking-flow__body">
        {/* ETAPA 1: SERVIÇO */}
        {step === 1 && (
          <div className="booking-flow__section">
            <div className="booking-flow__header-step">
              <h3>1. Escolha o serviço desejado</h3>
              <p>Selecione um dos nossos procedimentos de alto padrão</p>
            </div>

            <div className="booking-flow__service-list">
              {services.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                return (
                  <button
                    type="button"
                    key={srv.id}
                    className={`booking-flow__service-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                      setErrors({});
                    }}
                  >
                    <div className="booking-flow__service-info">
                      <div className="booking-flow__service-title-row">
                        <h4>{srv.name}</h4>
                        <span className="booking-flow__service-price">R$ {srv.price}</span>
                      </div>
                      <p className="booking-flow__service-desc">{srv.description}</p>
                      <div className="booking-flow__service-meta">
                        <Clock size={14} />
                        <span>Duração: {srv.duration_minutes} minutos</span>
                      </div>
                    </div>
                    <div className="booking-flow__radio-check">
                      <div className="booking-flow__check-circle">
                        {isSelected && <Check size={14} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.service && <p className="booking-flow__error-msg">{errors.service}</p>}
          </div>
        )}

        {/* ETAPA 2: BARBEIRO */}
        {step === 2 && (
          <div className="booking-flow__section">
            <div className="booking-flow__header-step">
              <h3>2. Escolha o profissional</h3>
              <p>Você pode escolher seu barbeiro de preferência ou o primeiro livre</p>
            </div>

            <div className="booking-flow__barber-grid">
              {/* Opção Qualquer disponível */}
              <button
                type="button"
                className={`booking-flow__barber-card ${selectedBarberId === "qualquer" ? "is-selected" : ""}`}
                onClick={() => setSelectedBarberId("qualquer")}
              >
                <div className="booking-flow__barber-avatar-placeholder">
                  <User size={24} />
                </div>
                <div className="booking-flow__barber-info">
                  <h4>Qualquer profissional</h4>
                  <p>Maior disponibilidade de horários</p>
                </div>
                {selectedBarberId === "qualquer" && <Check size={18} className="booking-flow__accent-check" />}
              </button>

              {/* Barbeiros cadastrados */}
              {barbers.map((b) => {
                const isSelected = selectedBarberId === b.id;
                return (
                  <button
                    type="button"
                    key={b.id}
                    className={`booking-flow__barber-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedBarberId(b.id)}
                  >
                    <img src={b.avatar_url} alt={b.name} className="booking-flow__barber-avatar" />
                    <div className="booking-flow__barber-info">
                      <h4>{b.name}</h4>
                      <p>{b.specialties || "Especialista em corte e barba"}</p>
                    </div>
                    {isSelected && <Check size={18} className="booking-flow__accent-check" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ETAPA 3: DATA */}
        {step === 3 && (
          <div className="booking-flow__section">
            <div className="booking-flow__header-step">
              <h3>3. Escolha a data</h3>
              <p>Selecione o dia em que deseja o atendimento</p>
            </div>

            <div className="booking-flow__date-picker-wrap">
              <label htmlFor="booking-date-input" className="booking-flow__field-label">
                <Calendar size={18} />
                <span>Data do atendimento</span>
              </label>
              <input
                id="booking-date-input"
                type="date"
                className="booking-flow__date-input"
                min={getTodayISO()}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
              />
            </div>

            {!availability.isOpen && (
              <div className="booking-flow__alert-banner">
                <AlertCircle size={20} />
                <span>{availability.reason || "Não haverá atendimento nesta data."}</span>
              </div>
            )}
            {errors.date && <p className="booking-flow__error-msg">{errors.date}</p>}
          </div>
        )}

        {/* ETAPA 4: HORÁRIOS DISPONÍVEIS */}
        {step === 4 && (
          <div className="booking-flow__section">
            <div className="booking-flow__header-step">
              <h3>4. Escolha o horário</h3>
              <p>
                Horários calculados para <strong>{selectedService?.name}</strong> ({selectedService?.duration_minutes} min) em{" "}
                <strong>{formatDateBR(selectedDate)}</strong>
              </p>
            </div>

            {loadingSlots ? (
              <div className="booking-flow__loading-slots">
                <div className="booking-flow__spinner" />
                <p>Verificando disponibilidade da equipe...</p>
              </div>
            ) : !availability.isOpen ? (
              <div className="booking-flow__alert-banner">
                <AlertCircle size={20} />
                <span>{availability.reason || "Estabelecimento fechado neste dia."}</span>
              </div>
            ) : availability.slots.length === 0 ? (
              <div className="booking-flow__empty-slots">
                <AlertCircle size={24} />
                <h4>Nenhum horário livre restante nesta data</h4>
                <p>Por favor, selecione outra data ou escolha outro profissional.</p>
                <button type="button" className="btn btn-outline" onClick={() => setStep(3)}>
                  Alterar data
                </button>
              </div>
            ) : (
              <div className="booking-flow__slots-grid">
                {availability.slots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      type="button"
                      key={slot.time}
                      className={`booking-flow__slot-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        setSelectedTime(slot.time);
                        setErrors({});
                      }}
                    >
                      <Clock size={14} />
                      <span className="booking-flow__slot-time">{slot.time}</span>
                      <span className="booking-flow__slot-sub">até {slot.endTime}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.time && <p className="booking-flow__error-msg">{errors.time}</p>}
          </div>
        )}

        {/* ETAPA 5: SEUS DADOS */}
        {step === 5 && (
          <div className="booking-flow__section">
            <div className="booking-flow__header-step">
              <h3>5. Seus dados de contato</h3>
              <p>Informações para confirmação do seu horário</p>
            </div>

            <div className="booking-flow__form-group">
              <div className="booking-flow__input-field">
                <label htmlFor="customer-name-field">
                  Nome completo <span className="booking-flow__req">*</span>
                </label>
                <input
                  id="customer-name-field"
                  type="text"
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="booking-flow__text-input"
                  autoComplete="name"
                />
                {errors.name && <p className="booking-flow__error-msg">{errors.name}</p>}
              </div>

              <div className="booking-flow__input-field">
                <label htmlFor="customer-phone-field">
                  WhatsApp / Celular com DDD <span className="booking-flow__req">*</span>
                </label>
                <input
                  id="customer-phone-field"
                  type="tel"
                  placeholder="Ex: (89) 9 9988-7766"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="booking-flow__text-input"
                  autoComplete="tel"
                />
                {errors.phone && <p className="booking-flow__error-msg">{errors.phone}</p>}
              </div>

              <div className="booking-flow__input-field">
                <label htmlFor="customer-notes-field">Observações ou preferências (opcional)</label>
                <textarea
                  id="customer-notes-field"
                  placeholder="Ex: Primeira vez na barbearia / prefiro máquina 2 nos lados"
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="booking-flow__text-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 6: REVISÃO & CONFIRMAÇÃO */}
        {step === 6 && (
          <div className="booking-flow__section">
            <div className="booking-flow__header-step">
              <h3>6. Revise e Confirme seu Agendamento</h3>
              <p>Confira todos os detalhes antes de concluir</p>
            </div>

            <div className="booking-flow__review-card">
              <div className="booking-flow__review-item">
                <Scissors size={20} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Serviço</span>
                  <strong className="booking-flow__review-value">{selectedService?.name}</strong>
                  <span className="booking-flow__review-sub">
                    R$ {selectedService?.price} · {selectedService?.duration_minutes} min
                  </span>
                </div>
              </div>

              <div className="booking-flow__review-item">
                <User size={20} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Profissional</span>
                  <strong className="booking-flow__review-value">{selectedBarber?.name}</strong>
                </div>
              </div>

              <div className="booking-flow__review-item">
                <Calendar size={20} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Data e Horário</span>
                  <strong className="booking-flow__review-value">
                    {formatDateBR(selectedDate)} às {selectedTime}
                  </strong>
                </div>
              </div>

              <div className="booking-flow__review-item">
                <Phone size={20} className="booking-flow__review-icon" />
                <div>
                  <span className="booking-flow__review-label">Cliente</span>
                  <strong className="booking-flow__review-value">{customerName}</strong>
                  <span className="booking-flow__review-sub">{customerPhone}</span>
                </div>
              </div>

              {customerNotes && (
                <div className="booking-flow__review-item">
                  <div className="booking-flow__review-notes">
                    <span className="booking-flow__review-label">Observações</span>
                    <p className="booking-flow__review-notes-text">{customerNotes}</p>
                  </div>
                </div>
              )}
            </div>

            {errors.submit && <p className="booking-flow__error-msg">{errors.submit}</p>}
          </div>
        )}
      </div>

      {/* Navegação Inferior (Voltar / Avançar / Confirmar) */}
      <div className="booking-flow__footer">
        {step > 1 ? (
          <button type="button" className="btn btn-outline" onClick={handleBack} disabled={submitting}>
            <ArrowLeft size={16} />
            Voltar
          </button>
        ) : (
          <div />
        )}

        {step < 6 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={step === 4 && (!selectedTime || !availability.isOpen || availability.slots.length === 0)}
          >
            Continuar
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary booking-flow__confirm-btn"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Confirmando..." : "Confirmar Agendamento"}
            <Check size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
