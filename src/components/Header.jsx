import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import "./Header.css";

const NAV_LINKS = [
  { label: "Início", href: "#topo" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Avaliações", href: "#avaliacoes" },
  { label: "Agendar", href: "#agendamento" },
  { label: "Localização", href: "#localizacao" },
];

export default function Header({ onOpenBookingModal, onOpenAdmin }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setIsOpen(false);

  return (
    <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="container site-header__row">
        <a href="#topo" className="site-header__logo" onClick={handleNavClick}>
          <span className="site-header__logo-mark" aria-hidden="true" />
          Novo Visual
        </a>

        <nav className={`site-header__nav ${isOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.href === "#agendamento" ? (
                  <button
                    type="button"
                    className="site-header__nav-btn"
                    onClick={() => {
                      handleNavClick();
                      if (onOpenBookingModal) onOpenBookingModal();
                    }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a href={link.href} onClick={handleNavClick}>
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              className="btn btn-primary site-header__cta"
              onClick={() => {
                handleNavClick();
                if (onOpenBookingModal) {
                  onOpenBookingModal();
                } else {
                  const el = document.getElementById("agendamento");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Agendar horário
            </button>

            <button
              type="button"
              onClick={() => {
                handleNavClick();
                if (onOpenAdmin) onOpenAdmin();
              }}
              title="Acessar Painel Administrativo (/admin)"
              style={{
                background: "transparent",
                border: "1px solid var(--color-line)",
                color: "var(--color-brass-bright)",
                padding: "0.55rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                cursor: "pointer",
                fontSize: "var(--step--1)",
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          </div>
        </nav>

        <button
          className="site-header__toggle"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
