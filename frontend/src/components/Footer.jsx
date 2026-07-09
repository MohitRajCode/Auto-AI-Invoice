import React from "react";
import { footerStyles } from "../assets/dummyStyles";

export default function Footer() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.container}>
        <div className={footerStyles.copyright}>
          © {new Date().getFullYear()} InvoiceAI · Built by Hexagon Digital
          Services
        </div>
        <div className={footerStyles.links}>
          <a href="/terms" className={footerStyles.link}>
            Terms
          </a>
          <a href="/privacy" className={footerStyles.link}>
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
