import { useEffect, useRef, useState } from "react";
import LiveShowcase from "./components/LiveShowcase";
import LiveStats from "./components/LiveStats";
import SocialLinks from "./components/SocialLinks";
import { type Lang, t } from "./i18n";

const WHATSAPP_PHONE = (import.meta.env.VITE_WHATSAPP_PHONE ?? "243812356774").replace(/\D/g, "");
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "hello@casahomesdrcongo.com";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? "support@casahomesdrcongo.com";
const IOS_APP_URL =
  import.meta.env.VITE_IOS_APP_URL ?? "https://apps.apple.com/cd/search?term=Casa%20Congo";
const ANDROID_APP_URL =
  import.meta.env.VITE_ANDROID_APP_URL ??
  "https://play.google.com/store/apps/details?id=com.casahomesrdc.app";
const WHATSAPP_DIRECT = `https://wa.me/${WHATSAPP_PHONE}`;
const WHATSAPP_DISPLAY = WHATSAPP_PHONE.startsWith("243") && WHATSAPP_PHONE.length >= 12
  ? `+243 ${WHATSAPP_PHONE.slice(3, 6)} ${WHATSAPP_PHONE.slice(6, 9)} ${WHATSAPP_PHONE.slice(9)}`
  : `+${WHATSAPP_PHONE}`;

function whatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function WaButton({
  message,
  children,
  variant = "primary",
  className = "",
}: {
  message: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <a
      href={whatsAppUrl(message)}
      className={`btn btn--${variant} ${className}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

function StoreIcon({ store }: { store: "ios" | "android" }) {
  if (store === "ios") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.7 12.6c0-2.4 2-3.4 2.1-3.5-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9s-1.9-.9-3.1-.8c-1.6.1-3.1 1-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.5 3 2.4 1.2-.1 1.6-.7 3.1-.7s1.8.7 3.1.7 2.1-1.2 2.9-2.3c.9-1.3 1.3-2.6 1.3-2.6s-2.6-1-2.6-4.2zM14.6 5.8c.6-.8 1.1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.6-1.3z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.6 2.3c-.3.2-.6.6-.6 1.1v17.2c0 .5.3.9.6 1.1l9.5-9.7L3.6 2.3zm11.2 6.4 2.3-1.3-9.1-5.3 6.8 6.6zm2.3 8.2-2.3-1.3-6.8 6.6 9.1-5.3zm.8-6.1-2.8 1.6 2.8 1.6 3.3-1.6-3.3-1.6z"
      />
    </svg>
  );
}

function StoreButtons({
  iosLabel,
  androidLabel,
  variant = "primary",
}: {
  iosLabel: string;
  androidLabel: string;
  variant?: "primary" | "light";
}) {
  const cls = variant === "light" ? "btn btn--store-light" : "btn btn--store";
  return (
    <div className="store-row">
      <a className={cls} href={IOS_APP_URL} target="_blank" rel="noopener noreferrer">
        <StoreIcon store="ios" />
        {iosLabel}
      </a>
      <a className={cls} href={ANDROID_APP_URL} target="_blank" rel="noopener noreferrer">
        <StoreIcon store="android" />
        {androidLabel}
      </a>
    </div>
  );
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lang: Lang = "fr";

  const c = t();

  useEffect(() => {
    document.documentElement.lang = "fr";
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#listings", label: c.nav.listings },
    { href: "#how", label: c.nav.how },
    { href: "#apps", label: c.nav.apps },
    { href: "#tenants", label: c.nav.tenants },
    { href: "#landlords", label: c.nav.landlords },
    { href: "#faq", label: c.nav.faq },
  ];

  return (
    <div className="site">
      <header
        className={`header${menuOpen ? " header--open" : ""}${scrolled ? " header--scrolled" : ""}`}
      >
        <div className="container header__inner">
          <a href="#" className="logo-link" onClick={() => setMenuOpen(false)}>
            <img src="/casa_logo_mark_master_1024.png" alt="Casa Congo" className="logo" />
          </a>

          <nav className="nav nav--desktop" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header__actions">
            <a href="#apps" className="btn btn--ghost header-cta">
              {c.nav.cta}
            </a>
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className="nav-mobile" aria-hidden={!menuOpen}>
          <nav className="nav nav--mobile" aria-label="Menu mobile">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <a href="#apps" className="btn btn--primary nav-mobile__cta" onClick={() => setMenuOpen(false)}>
              {c.nav.cta}
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__media" aria-hidden="true">
            <div className="hero__photo" />
            <div className="hero__veil" />
            <div className="hero__grain" />
          </div>
          <div className="container hero__inner">
            <p className="hero__brand">Casa Congo</p>
            <h1 className="hero__title">{c.hero.title}</h1>
            <p className="hero__lead">{c.hero.subtitle}</p>
            <div className="hero__actions">
              <StoreButtons iosLabel={c.apps.ios} androidLabel={c.apps.android} variant="light" />
              <WaButton message={c.wa.tenant} variant="ghost">
                {c.hero.ctaTenant}
              </WaButton>
            </div>
          </div>
        </section>

        <LiveShowcase lang={lang} ctaHref="#apps" />

        <Reveal>
          <section id="apps" className="section section--tone">
            <div className="container apps-block">
              <header className="section-head">
                <p className="eyebrow">{c.apps.eyebrow}</p>
                <h2>{c.apps.title}</h2>
                <p className="section-desc">{c.apps.subtitle}</p>
              </header>
              <StoreButtons iosLabel={c.apps.ios} androidLabel={c.apps.android} />
              <WaButton message={c.wa.tenant} className="apps-block__wa">
                {c.apps.whatsapp}
              </WaButton>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="how" className="section">
            <div className="container">
              <header className="section-head">
                <p className="eyebrow">{c.how.eyebrow}</p>
                <h2>{c.how.title}</h2>
                <p className="section-desc">{c.how.subtitle}</p>
              </header>
              <ol className="steps">
                {c.how.steps.map((step, i) => (
                  <li key={step.title} className="step">
                    <span className="step__num">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="tenants" className="section section--tone">
            <div className="container audience">
              <div className="audience__copy">
                <p className="eyebrow">{c.tenants.eyebrow}</p>
                <h2>{c.tenants.title}</h2>
                <ul className="bullet-list">
                  {c.tenants.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div className="audience__actions">
                  <a href="#apps" className="btn btn--primary">
                    {c.tenants.cta}
                  </a>
                  <WaButton message={c.wa.tenant} variant="ghost">
                    {c.tenants.ctaWhatsapp}
                  </WaButton>
                </div>
              </div>
              <aside className="audience__panel" aria-label={c.tenants.preview.label}>
                <p className="audience__panel-label">{c.tenants.preview.label}</p>
                <dl>
                  <div>
                    <dt>{c.tenants.preview.areaLabel}</dt>
                    <dd>{c.tenants.preview.area}</dd>
                  </div>
                  <div>
                    <dt>{c.tenants.preview.budgetLabel}</dt>
                    <dd>{c.tenants.preview.budget}</dd>
                  </div>
                  <div>
                    <dt>{c.tenants.preview.resultLabel}</dt>
                    <dd>{c.tenants.preview.result}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="landlords" className="section">
            <div className="container audience audience--reverse">
              <div className="audience__copy">
                <p className="eyebrow">{c.landlords.eyebrow}</p>
                <h2>{c.landlords.title}</h2>
                <ul className="bullet-list">
                  {c.landlords.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div className="audience__actions">
                  <a href="#apps" className="btn btn--primary">
                    {c.landlords.cta}
                  </a>
                  <WaButton message={c.wa.landlord} variant="ghost">
                    {c.landlords.ctaWhatsapp}
                  </WaButton>
                </div>
              </div>
              <aside className="audience__video" aria-label={c.landlords.video.label}>
                <p className="audience__panel-label">{c.landlords.video.label}</p>
                <p className="audience__video-title">{c.landlords.video.title}</p>
                <img
                  className="audience__video-player"
                  src="/casa_feature_graphic_1024x500.png"
                  alt="Casa Congo — trouvez un logement en RDC"
                />
              </aside>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <LiveStats lang={lang} />
        </Reveal>

        <Reveal>
          <section className="section section--tone">
            <div className="container">
              <header className="section-head section-head--left">
                <p className="eyebrow">{c.cities.eyebrow}</p>
                <h2>{c.cities.title}</h2>
                <p className="section-desc">{c.cities.subtitle}</p>
              </header>
              <ul className="city-rail">
                {c.cities.list.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="faq" className="section">
            <div className="container faq-layout">
              <header className="section-head section-head--left">
                <p className="eyebrow">{c.faq.eyebrow}</p>
                <h2>{c.faq.title}</h2>
              </header>
              <div className="faq-list">
                {c.faq.items.map((item) => (
                  <details key={item.q} className="faq-item">
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <section className="cta-band">
          <div className="container cta-band__inner">
            <div>
              <h2>{c.cta.title}</h2>
              <p>{c.cta.subtitle}</p>
            </div>
            <div className="cta-band__actions">
              <a href="#apps" className="btn btn--store-light">
                {c.cta.button}
              </a>
              <WaButton message={c.wa.tenant} variant="ghost">
                {c.cta.whatsapp}
              </WaButton>
            </div>
          </div>
        </section>

        <section id="help" className="section section--tone">
          <div className="container help">
            <header className="section-head">
              <p className="eyebrow">{c.help.eyebrow}</p>
              <h2>{c.help.title}</h2>
              <p className="section-desc">{c.help.subtitle}</p>
            </header>
            <div className="help__grid">
              <a className="help__link" href={WHATSAPP_DIRECT} target="_blank" rel="noopener noreferrer">
                <span>{c.help.whatsapp}</span>
                <strong>{WHATSAPP_DISPLAY}</strong>
              </a>
              <a className="help__link" href={`mailto:${CONTACT_EMAIL}`}>
                <span>{c.help.general}</span>
                <strong>{CONTACT_EMAIL}</strong>
              </a>
              <a className="help__link" href={`mailto:${SUPPORT_EMAIL}`}>
                <span>{c.help.support}</span>
                <strong>{SUPPORT_EMAIL}</strong>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__grid">
          <div>
            <img src="/casa_logo_mark_master_1024.png" alt="Casa Congo" className="footer__logo" />
            <p className="footer__tagline">{c.footer.tagline}</p>
            <a className="footer__domain" href="https://casahomesdrcongo.com">
              {c.footer.domain}
            </a>
            <nav className="footer__legal" aria-label="Mentions légales">
              <a href="/privacy/">{c.footer.privacy}</a>
              <a href="/terms/">{c.footer.terms}</a>
              <a href="/delete-account/">{c.footer.deleteAccount}</a>
            </nav>
          </div>
          <div className="footer__meta">
            <p className="footer__meta-label">{c.footer.contact}</p>
            <a href={WHATSAPP_DIRECT} target="_blank" rel="noopener noreferrer">
              WhatsApp · {WHATSAPP_DISPLAY}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </div>
          <div className="footer__social">
            <SocialLinks heading={c.footer.social} />
            <p className="footer__fine">{c.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
