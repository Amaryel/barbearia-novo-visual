import { useState, useEffect } from "react";
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
          <p className="kicker">Serviços</p>
          <h2>Cada serviço, um padrão só</h2>
          <p>
            Escolha o atendimento ideal para o seu estilo e garanta seu horário com nossos profissionais.
          </p>
        </div>

        <ul className="services__grid">
          {services.map((service) => (
            <li
              key={service.id}
              className="service-ticket"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (onSelectService) {
                  onSelectService(service.id);
                } else {
                  const el = document.getElementById("agendamento");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              title="Clique para agendar este serviço"
            >
              <div className="service-ticket__body">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </div>
              <div className="service-ticket__foot">
                <span className="service-ticket__duration">{service.duration} min</span>
                <span className="service-ticket__price">{currency.format(service.price)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
