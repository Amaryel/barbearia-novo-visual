import { useEffect } from "react";
import BookingFlow from "./BookingFlow";
import { X } from "lucide-react";
import "./BookingModal.css";

export default function BookingModal({ isOpen, onClose, initialServiceId = "" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <div>
            <p className="kicker">Agendamento Online</p>
            <h2 className="booking-modal-title">Reserve seu Horário</h2>
          </div>
          <button
            type="button"
            className="booking-modal-close"
            onClick={onClose}
            aria-label="Fechar janela de agendamento"
          >
            <X size={20} />
          </button>
        </div>

        <div className="booking-modal-body">
          <BookingFlow initialServiceId={initialServiceId} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
