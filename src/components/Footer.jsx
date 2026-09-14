import { useState } from "react";
import { BUSINESS } from "../utils/data";
import "./Footer.css";

const emptyContact = { name: "", phone: "", message: "" };

export default function Footer() {
  const [contact, setContact] = useState(emptyContact);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const whatsappHref = `https://wa.me/${BUSINESS.whatsappNumber}`;
  const telHref = `tel:+${BUSINESS.whatsappNumber}`;

  function handleSubmit(event) {
    event.preventDefault();
    if (!contact.name.trim() || !contact.phone.trim() || !contact.message.trim()) {
      setError("Preencha nome, telefone e mensagem para enviar.");
      return;
    }
    // PONTO DE INTEGRAÇÃO FUTURA: enviar para um endpoint/API própria ou serviço de e-mail.
    // Por ora, apenas confirma o recebimento na tela.
    setError("");
    setSent(true);
    setContact(emptyContact);
  }

  return (
    <footer id="contato" className="footer">
      <div className="container footer__grid">
        <div>
          <p className="kicker">Contato</p>
          <h2>Fale com a gente</h2>
          <ul className="footer__contact-list">
            <li>
              <a href={telHref}>{BUSINESS.phoneDisplay}</a>
            </li>
            <li>
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                Enviar mensagem no WhatsApp
              </a>
            </li>
          </ul>

          <ul className="footer__socials">
            {BUSINESS.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href}>{social.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <form className="footer__form" onSubmit={handleSubmit} noValidate>
          <div className="footer__field">
            <label htmlFor="contact-name">Nome</label>
            <input
              id="contact-name"
              type="text"
              value={contact.name}
              onChange={(event) => setContact((c) => ({ ...c, name: event.target.value }))}
            />
          </div>
          <div className="footer__field">
            <label htmlFor="contact-phone">Telefone</label>
            <input
              id="contact-phone"
              type="tel"
              value={contact.phone}
              onChange={(event) => setContact((c) => ({ ...c, phone: event.target.value }))}
            />
          </div>
          <div className="footer__field">
            <label htmlFor="contact-message">Mensagem</label>
            <textarea
              id="contact-message"
              rows={3}
              value={contact.message}
              onChange={(event) => setContact((c) => ({ ...c, message: event.target.value }))}
            />
          </div>
          {error && <p className="footer__error">{error}</p>}
          {sent && <p className="footer__success">Mensagem recebida — retornaremos em breve.</p>}
          <button type="submit" className="btn btn-primary">
            Enviar mensagem
          </button>
        </form>
      </div>

      <div className="container footer__bottom">
        <p>
          {BUSINESS.name} — {BUSINESS.city}
        </p>
        <p>Site institucional de demonstração.</p>
      </div>
    </footer>
  );
}
