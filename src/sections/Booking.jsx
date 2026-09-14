import { useMemo, useState } from "react";
import { BARBERS, BUSINESS, SERVICES, TIME_SLOTS, getMockedOccupiedSlots } from "../utils/data";
import { buildWhatsappLink, formatDateBR, isSlotTakenLocally, saveBooking } from "../utils/booking";
import "./Booking.css";

const STEPS = [
  { id: 1, label: "Serviço" },
  { id: 2, label: "Profissional" },
  { id: 3, label: "Data e horário" },
  { id: 4, label: "Seus dados" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  serviceId: "",
  barberId: "qualquer",
  date: "",
  time: "",
  name: "",
  phone: "",
};

export default function Booking() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const selectedService = SERVICES.find((service) => service.id === form.serviceId);
  const selectedBarber = BARBERS.find((barber) => barber.id === form.barberId);

  // Junta a ocupação simulada (mock) com o que já foi salvo localmente nesta sessão,
  // para que o próprio uso do formulário "preencha" a agenda de exemplo.
  const occupiedSlots = useMemo(() => {
    if (!form.date) return [];
    const mocked = getMockedOccupiedSlots(form.date);
    const local = TIME_SLOTS.filter((slot) => isSlotTakenLocally(form.date, slot));
    return Array.from(new Set([...mocked, ...local]));
  }, [form.date]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateStep(currentStep) {
    const nextErrors = {};
    if (currentStep === 1 && !form.serviceId) {
      nextErrors.serviceId = "Escolha um serviço para continuar.";
    }
    if (currentStep === 3) {
      if (!form.date) nextErrors.date = "Escolha uma data.";
      if (!form.time) nextErrors.time = "Escolha um horário disponível.";
    }
    if (currentStep === 4) {
      if (!form.name.trim()) nextErrors.name = "Informe seu nome.";
      if (!form.phone.trim()) nextErrors.phone = "Informe um telefone/WhatsApp para contato.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToStep(nextStep) {
    if (nextStep > step && !validateStep(step)) return;
    setStep(nextStep);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateStep(4)) return;

    const booking = {
      serviceId: form.serviceId,
      serviceName: selectedService?.name ?? "",
      barberId: form.barberId,
      barberName: selectedBarber?.name ?? "Qualquer disponível",
      date: form.date,
      time: form.time,
      name: form.name.trim(),
      phone: form.phone.trim(),
    };

    const saved = saveBooking(booking);
    setConfirmedBooking(saved);
  }

  function handleReset() {
    setForm(emptyForm);
    setErrors({});
    setStep(1);
    setConfirmedBooking(null);
  }

  if (confirmedBooking) {
    return (
      <section id="agendamento" className="section booking">
        <div className="container">
          <BookingConfirmation booking={confirmedBooking} onReset={handleReset} />
        </div>
      </section>
    );
  }

  return (
    <section id="agendamento" className="section booking">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Agendamento</p>
          <h2>Marque seu horário em 4 passos</h2>
          <p>
            Fluxo de demonstração: os agendamentos são salvos apenas neste
            navegador. Ao confirmar, você também poderá enviar os dados por
            WhatsApp para garantir o horário.
          </p>
        </div>

        <ol className="booking__steps" aria-label="Etapas do agendamento">
          {STEPS.map((item) => (
            <li key={item.id} className={item.id === step ? "is-active" : item.id < step ? "is-done" : ""}>
              <button type="button" onClick={() => goToStep(item.id)} disabled={item.id > step}>
                <span className="booking__step-number">{item.id}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>

        <form className="booking__form" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <fieldset className="booking__fieldset">
              <legend>Escolha o serviço</legend>
              <div className="booking__service-grid" role="radiogroup" aria-label="Serviço desejado">
                {SERVICES.map((service) => (
                  <label
                    key={service.id}
                    className={`booking__service-card ${form.serviceId === service.id ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="serviceId"
                      value={service.id}
                      checked={form.serviceId === service.id}
                      onChange={(event) => updateField("serviceId", event.target.value)}
                    />
                    <span className="booking__service-name">{service.name}</span>
                    <span className="booking__service-meta">
                      {service.duration} min · R$ {service.price}
                    </span>
                  </label>
                ))}
              </div>
              {errors.serviceId && <p className="booking__error">{errors.serviceId}</p>}
              <div className="booking__nav">
                <span />
                <button type="button" className="btn btn-primary" onClick={() => goToStep(2)}>
                  Continuar
                </button>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="booking__fieldset">
              <legend>Escolha o profissional</legend>
              <div className="booking__barber-list" role="radiogroup" aria-label="Profissional">
                {BARBERS.map((barber) => (
                  <label
                    key={barber.id}
                    className={`booking__barber-pill ${form.barberId === barber.id ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="barberId"
                      value={barber.id}
                      checked={form.barberId === barber.id}
                      onChange={(event) => updateField("barberId", event.target.value)}
                    />
                    {barber.name}
                  </label>
                ))}
              </div>
              <div className="booking__nav">
                <button type="button" className="btn btn-outline" onClick={() => goToStep(1)}>
                  Voltar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => goToStep(3)}>
                  Continuar
                </button>
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="booking__fieldset">
              <legend>Escolha data e horário</legend>
              <div className="booking__field">
                <label htmlFor="booking-date">Data</label>
                <input
                  id="booking-date"
                  type="date"
                  min={todayISO()}
                  value={form.date}
                  onChange={(event) => {
                    updateField("date", event.target.value);
                    updateField("time", "");
                  }}
                />
                {errors.date && <p className="booking__error">{errors.date}</p>}
              </div>

              <div className="booking__field">
                <span id="booking-time-label">Horário</span>
                {!form.date && <p className="booking__hint">Escolha uma data para ver os horários.</p>}
                {form.date && (
                  <div className="booking__slots" role="radiogroup" aria-labelledby="booking-time-label">
                    {TIME_SLOTS.map((slot) => {
                      const isTaken = occupiedSlots.includes(slot);
                      return (
                        <label
                          key={slot}
                          className={`booking__slot ${form.time === slot ? "is-selected" : ""} ${
                            isTaken ? "is-taken" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="time"
                            value={slot}
                            disabled={isTaken}
                            checked={form.time === slot}
                            onChange={(event) => updateField("time", event.target.value)}
                          />
                          {slot}
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors.time && <p className="booking__error">{errors.time}</p>}
              </div>

              <div className="booking__nav">
                <button type="button" className="btn btn-outline" onClick={() => goToStep(2)}>
                  Voltar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => goToStep(4)}>
                  Continuar
                </button>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="booking__fieldset">
              <legend>Seus dados</legend>
              <div className="booking__field">
                <label htmlFor="booking-name">Nome</label>
                <input
                  id="booking-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
                {errors.name && <p className="booking__error">{errors.name}</p>}
              </div>
              <div className="booking__field">
                <label htmlFor="booking-phone">Telefone / WhatsApp</label>
                <input
                  id="booking-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(89) 9 9999-9999"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
                {errors.phone && <p className="booking__error">{errors.phone}</p>}
              </div>

              <div className="booking__summary">
                <p className="booking__summary-title">Resumo</p>
                <ul>
                  <li>{selectedService?.name ?? "—"}</li>
                  <li>{selectedBarber?.name ?? "—"}</li>
                  <li>
                    {form.date ? formatDateBR(form.date) : "—"} {form.time && `às ${form.time}`}
                  </li>
                </ul>
              </div>

              <div className="booking__nav">
                <button type="button" className="btn btn-outline" onClick={() => goToStep(3)}>
                  Voltar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar agendamento
                </button>
              </div>
            </fieldset>
          )}
        </form>
      </div>
    </section>
  );
}

function BookingConfirmation({ booking, onReset }) {
  const whatsappLink = buildWhatsappLink(booking);

  return (
    <div className="booking__confirmation">
      <p className="kicker">Agendamento registrado</p>
      <h2>
        Tudo certo, {booking.name.split(" ")[0]}.
        <br />
        Falta só confirmar pelo WhatsApp.
      </h2>
      <p>
        Seu horário foi salvo neste dispositivo. Como ainda não há um sistema de
        confirmação automática, envie os dados abaixo para a {BUSINESS.name}{" "}
        garantir seu horário na agenda oficial.
      </p>

      <dl className="booking__confirmation-summary">
        <div>
          <dt>Serviço</dt>
          <dd>{booking.serviceName}</dd>
        </div>
        <div>
          <dt>Profissional</dt>
          <dd>{booking.barberName}</dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>{formatDateBR(booking.date)}</dd>
        </div>
        <div>
          <dt>Horário</dt>
          <dd>{booking.time}</dd>
        </div>
      </dl>

      <div className="booking__nav">
        <button type="button" className="btn btn-outline" onClick={onReset}>
          Fazer outro agendamento
        </button>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-primary">
          Confirmar no WhatsApp
        </a>
      </div>
    </div>
  );
}
