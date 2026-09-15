import { Sparkles, Scissors, Clock, Coffee, ShieldCheck } from "lucide-react";
import "./About.css";

export default function About() {
  return (
    <section id="sobre" className="section about">
      <div className="container about__grid">
        <div className="about__media">
          <div className="about__media-container">
            <img
              src="https://images.unsplash.com/photo-1611313151697-d626e818dddf?q=80&w=1000&auto=format&fit=crop"
              alt="Cadeira de barbeiro em couro preto em ambiente sofisticado"
              loading="lazy"
              width="1000"
              height="1250"
              className="about__img"
            />
            <div className="about__experience-badge">
              <span className="about__badge-num">+10</span>
              <span className="about__badge-text">Anos de Excelência em Picos</span>
            </div>
          </div>
        </div>

        <div className="about__copy">
          <p className="kicker">Sobre a Novo Visual</p>
          <h2>Um espaço para cuidar da sua imagem com calma e maestria</h2>
          <p>
            Fundada para quem valoriza cada detalhe da sua apresentação pessoal, a Barbearia Novo Visual
            reúne tradição na navalha, técnicas contemporâneas de visagismo e um ambiente acolhedor.
            Aqui cada atendimento é conduzido no seu tempo — sem pressa, sem fila, com máxima precisão.
          </p>
          <p>
            Comandada pelo barbeiro Leandro, nosso compromisso é oferecer uma experiência completa que vai
            além do corte: toalha quente aromatizada, produtos de alta performance e consultoria de estilo.
          </p>

          {/* Grid de Diferenciais */}
          <div className="about__pillars">
            <div className="about__pillar-item">
              <div className="about__pillar-icon">
                <Scissors size={20} />
              </div>
              <div>
                <h4>Cortes Personalizados</h4>
                <p>Visagismo facial adequado ao seu formato e rotina.</p>
              </div>
            </div>

            <div className="about__pillar-item">
              <div className="about__pillar-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h4>Barboterapia & Toalha Quente</h4>
                <p>Abertura de poros, massagem facial e hidratação profunda.</p>
              </div>
            </div>

            <div className="about__pillar-item">
              <div className="about__pillar-icon">
                <Clock size={20} />
              </div>
              <div>
                <h4>Zero Espera</h4>
                <p>Compromisso rigoroso com o horário do seu agendamento.</p>
              </div>
            </div>

            <div className="about__pillar-item">
              <div className="about__pillar-icon">
                <Coffee size={20} />
              </div>
              <div>
                <h4>Ambiente Climatizado</h4>
                <p>Café expresso cortesia, cerveja artesanal e Wi-Fi veloz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
