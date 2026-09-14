import "./About.css";

export default function About() {
  return (
    <section id="sobre" className="section about">
      <div className="container about__grid">
        <div className="about__media">
          <img
            src="https://images.unsplash.com/photo-1611313151697-d626e818dddf?q=80&w=1000&auto=format&fit=crop"
            alt="Cadeira de barbeiro em couro preto em ambiente sofisticado"
            loading="lazy"
            width="1000"
            height="1250"
          />
        </div>

        <div className="about__copy">
          <p className="kicker">Sobre a Novo Visual</p>
          <h2>Um espaço para cuidar da própria imagem com calma</h2>
          <p>
            Fundada para quem já não se contenta com qualquer corte, a Novo Visual
            reúne profissionais experientes, materiais de qualidade e um ambiente
            pensado nos mínimos detalhes. Cada visita é conduzida no seu tempo — sem
            pressa, sem fila, sem imprevisto.
          </p>
          <p>
            Aqui, atendimento exclusivo não é discurso: é agenda por horário marcado,
            profissional de sua confiança e um espaço que respeita quem senta na
            cadeira.
          </p>
          <dl className="about__stats">
            <div>
              <dt>+8 anos</dt>
              <dd>de experiência dos profissionais</dd>
            </div>
            <div>
              <dt>100%</dt>
              <dd>atendimento com hora marcada</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
