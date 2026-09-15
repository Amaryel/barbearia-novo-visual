import BookingFlow from "../components/BookingFlow";
import "./Booking.css";

export default function Booking() {
  return (
    <section id="agendamento" className="section booking">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Agendamento Online</p>
          <h2>Marque seu horário em poucos cliques</h2>
          <p>
            Escolha o serviço, seu profissional de preferência e o melhor horário disponível na nossa agenda.
          </p>
        </div>

        <div className="booking__card-wrapper">
          <BookingFlow />
        </div>
      </div>
    </section>
  );
}
