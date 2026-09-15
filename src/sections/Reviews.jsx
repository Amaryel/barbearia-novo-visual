import { Star, Quote, CheckCircle } from "lucide-react";
import "./Reviews.css";

const REVIEWS = [
  {
    name: "Dr. Marcos Vinícius",
    role: "Cliente fiel há 3 anos",
    rating: 5,
    date: "Avaliado no Google",
    comment:
      "A melhor barbearia de Picos sem dúvidas! O Leandro é extremamente caprichoso na tesoura e na barba. O agendamento online facilita demais a vida, chego e sou atendido na hora certa.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Felipe Albuquerque",
    role: "Advogado",
    rating: 5,
    date: "Avaliado no Google",
    comment:
      "Ambiente impecável, climatizado e com um café de primeira. Pontualidade britânica e acabamento na navalha perfeito. Recomendo para quem preza por cuidado e excelência.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Thiago Mendes",
    role: "Empresário",
    rating: 5,
    date: "Avaliado no Google",
    comment:
      "Fiz o combo corte e barboterapia. A toalha quente e os produtos usados são diferenciados. É uma experiência que vai muito além de um simples corte de cabelo.",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop",
  },
];

export default function Reviews() {
  return (
    <section id="avaliacoes" className="section reviews">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Depoimentos</p>
          <h2>O que nossos clientes dizem</h2>
          <p>
            Experiências reais de quem confia o estilo e a imagem à Barbearia Novo Visual.
          </p>
        </div>

        <div className="reviews__grid">
          {REVIEWS.map((review, idx) => (
            <div className="review-card" key={idx}>
              <div className="review-card__header">
                <div className="review-card__stars">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="review-card__star" />
                  ))}
                </div>
                <Quote size={24} className="review-card__quote-icon" />
              </div>

              <p className="review-card__text">"{review.comment}"</p>

              <div className="review-card__author">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="review-card__avatar"
                  loading="lazy"
                  width="44"
                  height="44"
                />
                <div className="review-card__info">
                  <h4 className="review-card__name">
                    {review.name}
                    <CheckCircle size={14} className="review-card__verified" title="Cliente verificado" />
                  </h4>
                  <span className="review-card__role">{review.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
