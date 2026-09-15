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
          <p className="kicker">Barbearia · Picos, PI</p>
          <h1>
            Onde o corte é
            <br />
            ritual, não rotina.
          </h1>
          <p className="hero__lead">
            Ambiente sofisticado, profissionais experientes e atenção a cada detalhe —
            da navalha ao acabamento. A Novo Visual foi pensada para quem trata o
            próprio estilo como investimento.
          </p>
          <div className="hero__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (onOpenBookingModal) {
                  onOpenBookingModal();
                } else {
                  const el = document.getElementById("agendamento");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Agendar horário
            </button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn btn-outline">
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="hero__media">
          <img
            src="https://images.unsplash.com/photo-1699641975121-5c3f55a553e5?q=80&w=1200&auto=format&fit=crop"
            alt="Cliente sendo atendido em cadeira de barbearia, com barbeiro finalizando o corte"
            width="1200"
            height="1500"
          />
          <span className="hero__media-line" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
