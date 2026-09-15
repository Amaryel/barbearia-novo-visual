import { Award, Clock, Star, MapPin } from "lucide-react";
import "./TrustBar.css";

const HIGHLIGHTS = [
  {
    icon: Award,
    title: "+10 Anos de Experiência",
    subtitle: "Mestres em cortes clássicos & modernos",
  },
  {
    icon: Star,
    title: "4.9 / 5.0 no Google",
    subtitle: "Mais de 180 avaliações 5 estrelas",
  },
  {
    icon: Clock,
    title: "100% com Hora Marcada",
    subtitle: "Pontualidade e zero fila de espera",
  },
  {
    icon: MapPin,
    title: "Centro de Picos, PI",
    subtitle: "Fácil acesso e conveniência",
  },
];

export default function TrustBar() {
  return (
    <section className="trust-bar" aria-label="Destaques e diferenciais da barbearia">
      <div className="container">
        <div className="trust-bar__grid">
          {HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div className="trust-bar__item" key={idx}>
                <div className="trust-bar__icon-box">
                  <Icon size={22} />
                </div>
                <div className="trust-bar__content">
                  <h4 className="trust-bar__title">{item.title}</h4>
                  <p className="trust-bar__subtitle">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
