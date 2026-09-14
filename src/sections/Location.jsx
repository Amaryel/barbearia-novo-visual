import { BUSINESS } from "../utils/data";
import "./Location.css";

export default function Location() {
  return (
    <section id="localizacao" className="section location">
      <div className="container location__grid">
        <div>
          <p className="kicker">Localização</p>
          <h2>Venha nos visitar</h2>
          <p className="location__address">{BUSINESS.address}</p>
          <p className="location__note">Endereço de exemplo — atualizar com o endereço real.</p>

          <dl className="location__hours">
            {BUSINESS.hours.map((entry) => (
              <div key={entry.days}>
                <dt>{entry.days}</dt>
                <dd>{entry.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="location__map">
          <iframe
            title="Mapa de localização da Barbearia Novo Visual"
            src={BUSINESS.mapsEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
