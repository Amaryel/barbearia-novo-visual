import { Calendar, MessageCircle, Star, Clock, Coffee, Scissors, CheckCircle2 } from "lucide-react";
import { BUSINESS } from "../utils/data";
import "./Hero.css";

export default function Hero({ onOpenBookingModal }) {
  const whatsappHref = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
    "Olá! Gostaria de mais informações sobre a Barbearia Novo Visual."
  )}`;

  return (
    <section id="topo" className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          {/* Badge de Confiança e Localização */}
          <div className="hero__badge-row">
            <span className="hero__badge">
              <span className="hero__badge-dot" />
              Barbearia · Picos, PI
            </span>
            <span className="hero__rating-badge">
              <Star size={14} className="hero__star-icon" />
              <strong>4.9</strong>
              <span className="hero__rating-count">(180+ avaliações)</span>
            </span>
          </div>

          <h1 className="hero__title">
            Onde o corte é <span className="hero__highlight">ritual</span>, não rotina.
          </h1>

          <p className="hero__lead">
            Ambiente exclusivo, corte na tesoura e acabamento impecável na navalha.
            Agende seu horário online em menos de 1 minuto e desfrute de um atendimento pontual,
            sem filas e com café expresso de cortesia.
          </p>

          {/* Destaques Rápidos */}
          <ul className="hero__features-list">
            <li>
              <CheckCircle2 size={18} className="hero__check-icon" />
              <span>Atendimento 100% com horário marcado</span>
            </li>
            <li>
              <CheckCircle2 size={18} className="hero__check-icon" />
              <span>Barboterapia, toalha quente e acabamento na navalha</span>
            </li>
            <li>
              <CheckCircle2 size={18} className="hero__check-icon" />
              <span>Ambiente climatizado com café expresso</span>
            </li>
          </ul>

          {/* Botões de Ação */}
          <div className="hero__actions">
            <button
              type="button"
              className="btn btn-primary hero__cta-primary"
              onClick={() => {
                if (onOpenBookingModal) {
                  onOpenBookingModal();
                } else {
                  const el = document.getElementById("agendamento");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              <Calendar size={18} />
              <span>Agendar Horário Online</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline hero__cta-secondary"
            >
              <MessageCircle size={18} />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          {/* Prova Social Rápida */}
          <div className="hero__social-proof">
            <div className="hero__avatars">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                alt="Cliente satisfeito"
                className="hero__avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop"
                alt="Cliente satisfeito"
                className="hero__avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=120&auto=format&fit=crop"
                alt="Cliente satisfeito"
                className="hero__avatar"
              />
            </div>
            <div className="hero__proof-text">
              <span className="hero__proof-stars">★★★★★</span>
              <p>Mais de <strong>2.500 clientes</strong> satisfeitos em Picos e região</p>
            </div>
          </div>
        </div>

        {/* Coluna da Imagem com Cards Flutuantes */}
        <div className="hero__media-wrapper">
          <div className="hero__media">
            <img
              src="https://images.unsplash.com/photo-1699641975121-5c3f55a553e5?q=80&w=1000&auto=format&fit=crop"
              alt="Cliente sendo atendido em cadeira de barbearia com acabamento profissional"
              width="800"
              height="950"
              className="hero__main-image"
            />
            <span className="hero__media-line" aria-hidden="true" />

            {/* Card Flutuante Superior */}
            <div className="hero__floating-card hero__floating-card--top">
              <div className="hero__floating-icon">
                <Clock size={18} />
              </div>
              <div>
                <span className="hero__floating-title">Agenda Aberta</span>
                <span className="hero__floating-subtitle">Horários para esta semana</span>
              </div>
            </div>

            {/* Card Flutuante Inferior */}
            <div className="hero__floating-card hero__floating-card--bottom">
              <div className="hero__floating-icon hero__floating-icon--gold">
                <Scissors size={18} />
              </div>
              <div>
                <span className="hero__floating-title">Leandro Barbeiro</span>
                <span className="hero__floating-subtitle">Especialista em Navalha & Barba</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
