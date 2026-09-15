import BookingFlow from "../components/BookingFlow";
import "./Booking.css";

export default function Booking() {
  return (
    <section id="agendamento" className="section booking">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Agendamento Fácil & Rápido</p>
          <h2>Marque seu horário em poucos passos</h2>
          <p>
            Escolha o serviço desejado, confira os horários livres com o Barbeiro Leandro e garanta seu atendimento sem complicação.
          </p>
        </div>

        <div className="booking__card-wrapper">
          <BookingFlow />
        </div>
      </div>
    </section>
  );
}
