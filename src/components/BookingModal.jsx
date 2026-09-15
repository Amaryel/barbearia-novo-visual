import { useEffect } from "react";
import BookingFlow from "./BookingFlow";
import { X } from "lucide-react";
import { pauseSmoothScroll, resumeSmoothScroll } from "../utils/smoothScroll";
import "./BookingModal.css";

export default function BookingModal({ isOpen, onClose, initialServiceId = "" }) {
  useEffect(() => {
    if (isOpen) {
      pauseSmoothScroll();
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        const bodyEl = document.querySelector(".booking-modal-body");
        if (bodyEl) {
          bodyEl.scrollTop = 0;
        }
      }, 50);
    } else {
      resumeSmoothScroll();
      document.body.style.overflow = "";
    }
    return () => {
      resumeSmoothScroll();
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="booking-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      data-lenis-prevent="true"
    >
      <div
        className="booking-modal-content"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
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

        <div className="booking-modal-body" data-lenis-prevent="true">
          <BookingFlow initialServiceId={initialServiceId} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

