import { useState, useEffect } from "react";
import { Clock, ArrowRight, Scissors } from "lucide-react";
import { serviceService } from "../services/serviceService";
import { storage } from "../services/storage";
import { SERVICES as DEFAULT_SERVICES } from "../utils/data";
import "./Services.css";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Services({ onSelectService }) {
  const [services, setServices] = useState(DEFAULT_SERVICES);

  async function loadServices() {
    try {
      const list = await serviceService.getActive();
      if (list && list.length > 0) {
        setServices(
          list.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            duration: s.duration_minutes,
            price: s.price,
          }))
        );
      }
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
    }
  }

  useEffect(() => {
    loadServices();
    const unsubscribe = storage.subscribe(() => {
      loadServices();
    });
    return unsubscribe;
  }, []);

  return (
    <section id="servicos" className="section services">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Nossos Serviços</p>
          <h2>Menu de Atendimentos</h2>
          <p>
            Escolha o serviço desejado e garanta seu horário exclusivo com nossos mestres barbeiros.
          </p>
        </div>

        <ul className="services__grid">
          {services.map((service, index) => {
            const isPopular = index === 0 || service.name.toLowerCase().includes("combo");
            return (
              <li
                key={service.id}
                className={`service-ticket ${isPopular ? "is-popular" : ""}`}
                onClick={() => {
                  if (onSelectService) {
                    onSelectService(service.id);
                  } else {
                    const el = document.getElementById("agendamento");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (onSelectService) onSelectService(service.id);
                  }
                }}
                title="Clique para agendar este corte/serviço"
              >
                {isPopular && <span className="service-ticket__badge">Mais Solicitado</span>}

                <div className="service-ticket__body">
                  <div className="service-ticket__title-row">
                    <Scissors size={18} className="service-ticket__icon" />
                    <h3>{service.name}</h3>
                  </div>
                  <p>{service.description}</p>
                </div>

                <div className="service-ticket__foot">
                  <div className="service-ticket__meta">
                    <span className="service-ticket__duration">
                      <Clock size={14} />
                      {service.duration} min
                    </span>
                    <span className="service-ticket__price">{currency.format(service.price)}</span>
                  </div>

                  <span className="service-ticket__btn-action">
                    Agendar <ArrowRight size={14} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
