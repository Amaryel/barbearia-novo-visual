import "./Gallery.css";

// Imagens placeholder (Unsplash) — substituir por fotos reais do ambiente e dos cortes.
const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=900&auto=format&fit=crop",
    alt: "Cliente sentado em cadeira de barbeiro durante atendimento",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=900&auto=format&fit=crop",
    alt: "Barbeiro usando navalha para finalizar o corte",
  },
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=900&auto=format&fit=crop",
    alt: "Ferramentas de barbeiro organizadas sobre bancada",
  },
  {
    src: "https://images.unsplash.com/photo-1536520002442-39764a41e987?q=80&w=900&auto=format&fit=crop",
    alt: "Interior de barbearia com iluminação em pendentes",
  },
  {
    src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=900&auto=format&fit=crop",
    alt: "Cadeira de couro preto junto a parede de tijolo aparente",
  },
  {
    src: "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?q=80&w=900&auto=format&fit=crop",
    alt: "Barbeiro cortando o cabelo de um cliente com tesoura",
  },
];

export default function Gallery() {
  return (
    <section id="galeria" className="section gallery">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Galeria</p>
          <h2>O ambiente e o trabalho</h2>
        </div>

        <div className="gallery__grid">
          {GALLERY_IMAGES.map((image) => (
            <div className="gallery__item" key={image.src}>
              <img src={image.src} alt={image.alt} loading="lazy" width="900" height="900" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
