import { SERVICES } from "../utils/data";
import "./Services.css";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function Services() {
  return (
    <section id="servicos" className="section services">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Serviços</p>
          <h2>Cada serviço, um padrão só</h2>
          <p>
            Valores de exemplo — substituir pela tabela real de preços do
            estabelecimento.
          </p>
        </div>

        <ul className="services__grid">
          {SERVICES.map((service) => (
            <li key={service.id} className="service-ticket">
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
