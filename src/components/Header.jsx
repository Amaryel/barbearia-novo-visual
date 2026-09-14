import { useEffect, useState } from "react";
import "./Header.css";

const NAV_LINKS = [
  { label: "Início", href: "#topo" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Agendar", href: "#agendamento" },
  { label: "Localização", href: "#localizacao" },
  { label: "Contato", href: "#contato" },
];

export default function Header() {
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
              <li key={link.href}>
                <a href={link.href} onClick={handleNavClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#agendamento" className="btn btn-primary site-header__cta" onClick={handleNavClick}>
            Agendar horário
          </a>
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
