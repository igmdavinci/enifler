let products = [
  { id: "5805519", name: "PC Gamer Completo Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, 6UCY5D2A-E", price: 3433.41, image: "assets/products/5805519.png" },
  { id: "5805518", name: "PC Gamer Completo Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, K4DM83MJ-E", price: 3423.12, image: "assets/products/5805518.png" },
  { id: "5805515", name: "PC Gamer Completo Ryzen 5 4600G, 16GB DDR4, SSD 480GB, 400W 80 Plus, 8CMAOJEG-E", price: 3571.53, image: "assets/products/5805515.png" },
  { id: "5805507", name: "PC Gamer Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, D4XJYMIK-E", price: 2949.50, image: "assets/products/5805507.png" },
  { id: "5805506", name: "PC Gamer Ryzen 5 5600G, 16GB DDR4, SSD 480GB, 500W 80 Plus, K17YCP2E-E", price: 2939.22, image: "assets/products/5805506.png" },
  { id: "5805502", name: "PC Gamer Ryzen 5 4600G, 16GB DDR4, SSD 480GB, 400W 80 Plus, QEPF4Q9K-E", price: 3077.34, image: "assets/products/5805502.png" },
  { id: "7613793", name: "PC Gamer Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, LBN197R8G-E", price: 5365.97, image: "assets/products/7613793.jpg" },
  { id: "7613791", name: "PC Gamer Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, LBN197R8F-E", price: 5378.21, image: "assets/products/7613791.png" },
  { id: "7613779", name: "PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAF-E", price: 5862.11, image: "assets/products/7613779.png" },
  { id: "7613770", name: "PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAE-E", price: 5849.87, image: "assets/products/7613770.png" },
  { id: "7613713", name: "PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAB-E", price: 5901.04, image: "assets/products/7613713.png" },
  { id: "7613696", name: "PC Gamer Completo Ryzen 5 5500, RTX 3060, 16GB DDR4, SSD 480GB, 600W 80 Plus, GDYN4MEAA-E", price: 5896.96, image: "assets/products/7613696.png" }
];

const storageKey = "enifler-cart-v1";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const MAX_INSTALLMENT_INCREASE_RATE = 0.10; // juros máximo de 10% no total até 12x
const app = document.querySelector("#app");
let currentUser = null;
let afterAuthentication = null;
let paymentPoll = null;
let orderSummaryLoading = false;
const icons = {
  facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.1 8.2h3.1V4.1c-.5-.1-2.2-.2-4.2-.2-4.1 0-6.9 2.5-6.9 7v3.2H2.5v4.6h4.6V24h5.1v-5.3h4l.8-4.6h-4.8v-2.7c0-1.3.4-2.2 2.9-2.2z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.9 10.4 22.1 1h-2l-7.1 8.1L7.4 1H1l8.6 12.5L1 23h2l7.5-8.5 6 8.5H23L13.9 10.4zm-2.7 3.1-.9-1.2L3.4 2.5h3l5.5 7.8.9 1.2 7.3 10.2h-3l-5.9-8.2z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 4.2A3.8 3.8 0 1 1 12 15.8 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 12 13.8 1.8 1.8 0 0 0 12 10.2zM17.8 6.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 1.8C6.6 1.8 3.7 5.4 3.7 9.4c0 2.2 1.2 4.9 3.1 5.7.3.1.5.1.6-.3l.4-1.6c.1-.2.1-.4-.1-.6-.6-.7-1-1.8-1-2.9 0-3.2 2.4-6.3 6.4-6.3 3.5 0 5.9 2.4 5.9 5.8 0 3.9-2 6.6-4.6 6.6-1.4 0-2.4-1.1-2.1-2.5.4-1.6 1.1-3.4 1.1-4.6 0-1.1-.6-1.9-1.8-1.9-1.4 0-2.6 1.5-2.6 3.5 0 1.3.4 2.1.4 2.1l-1.8 7.4c-.5 2 .1 5 .1 5s.1.1.2 0c.1-.2 2.1-2.6 2.7-4.5l.8-3.1c.4.8 1.6 1.5 2.9 1.5 3.8 0 6.6-3.5 6.6-8.7 0-4.6-3.8-8-8.8-8z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.4 6.8a3 3 0 0 0-2.1-2.1C19.4 4.2 12 4.2 12 4.2s-7.4 0-9.3.5A3 3 0 0 0 .6 6.8 31 31 0 0 0 .1 12a31 31 0 0 0 .5 5.2 3 3 0 0 0 2.1 2.1c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.2 31 31 0 0 0-.5-5.2zM9.7 15.4V8.6L15.8 12l-6.1 3.4z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.4 8.3h4.2V24H.4V8.3zm7.4 0h4v2.1h.1c.6-1.1 2-2.4 4.2-2.4 4.5 0 5.3 3 5.3 6.8V24h-4.2v-8.2c0-2 0-4.5-2.7-4.5s-3.1 2.1-3.1 4.3V24H7.8V8.3z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.4 2.2 19.8 21c-.3 1.3-1 1.6-2 1l-5.6-4.1-2.7 2.6c-.3.3-.6.6-1.2.6l.4-5.7L19.1 6c.5-.4-.1-.7-.7-.3L5.6 13.8.1 12.1c-1.2-.4-1.2-1.2.3-1.8L21.8 2c1-.4 1.9.2 1.6.2z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 1c.4 3 2.1 4.8 5 5v4.1c-1.8.2-3.5-.4-5-1.4v7.7c0 4.9-5.3 8.2-9.8 5.8-2.9-1.5-4.2-4.9-3.1-8 1.1-3.2 4.2-5 7.6-4.4v4.3c-.6-.2-1.2-.2-1.8-.1-1.7.3-2.7 1.9-2.2 3.5.5 1.6 2.3 2.4 3.8 1.6 1-.5 1.4-1.4 1.4-2.5V1H17z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.7 0 1.2.5 1.2 1.2v3.5c0 .7-.5 1.2-1.2 1.2A18.2 18.2 0 0 1 2.6 3.4c0-.7.5-1.2 1.2-1.2h3.5c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.7.6 4 .1.4 0 .8-.3 1.2l-2.2 2.2z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.7 11.7 0 0 0 2.1 17.6L.5 23.5l6-1.6A11.7 11.7 0 0 0 20.5 3.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.6 1 1-3.5-.2-.4A9.1 9.1 0 1 1 12 21zm5-6.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.8 0 1.7 1.2 3.3 1.4 3.5.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.8 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.5z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm18 3.2-8.4 5.3a1.2 1.2 0 0 1-1.2 0L3 8.2V17h18V8.2zM4.3 7l7.7 4.8L19.7 7H4.3z"/></svg>`
};
const categories = [
  ["pc-gamer", "PC Gamer", "pc-gamer.html"],
  ["pc-gamer-completo", "PC Gamer Completo", "pc-gamer-completo.html"],
  ["computadores", "Computadores", "computadores.html"],
  ["hardware", "Hardware", "hardware.html"],
  ["acessorios", "Acessórios", "acessorios.html"],
  ["monitor", "Monitores", "monitor.html"],
  ["cadeira-gamer", "Cadeiras", "cadeira-gamer.html"],
  ["kit-upgrade", "Kit Upgrade", "kit-upgrade.html"],
  ["memoria", "Memórias", "memoria.html"],
  ["gabinete", "Gabinetes", "gabinete.html"],
  ["fonte", "Fontes", "fonte.html"],
  ["headset", "Headsets", "headset.html"],
  ["mouse", "Mouses", "mouse.html"],
  ["mouse-pad", "Mouse Pad", "mouse-pad-1.html"],
  ["kit-mouse-teclado", "Kit Mouse e Teclado", "kit-mouse-teclado.html"],
  ["microfones", "Microfones", "microfones.html"],
  ["controles-e-volantes", "Controles e Volantes", "controles-e-volantes.html"],
  ["consoles", "Consoles", "consoles.html"],
  ["coolers", "Coolers", "coolers.html"],
  ["eletronicos", "Eletrônicos", "eletronicos.html"],
  ["notebook", "Notebook", "notebook.html"],
  ["hard-disk", "Hard Disk", "hard-disk.html"],
  ["fitas-led", "Fitas LED", "fitas-led.html"],
  ["pasta-termica", "Pasta Térmica", "pasta-termica.html"]
];

function currentCategory() {
  const slug = document.body.dataset.category || "pc-gamer";
  const found = categories.find(([categorySlug]) => categorySlug === slug);
  return {
    slug,
    name: document.body.dataset.categoryName || found?.[1] || "Produtos",
    url: found?.[2] || "pc-gamer.html"
  };
}

function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(parsed) ? parsed.filter(item => products.some(p => p.id === item.id) && item.qty > 0) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(storageKey, JSON.stringify(cart));
  updateCount();
}

function itemCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function header() {
  return `
    <div class="legacy-award">ORGULHO DE SER CAMPE&Atilde;O! <span>&#9733;</span></div>
    <header class="header legacy-header">
      <div class="legacy-top">
        <div class="container">
          <nav aria-label="Atalhos">
            <a href="pc-gamer.html">Ofertas</a><a href="computadores.html">Computadores</a><a href="hardware.html">Hardware</a><a href="acessorios.html">Perif&eacute;ricos</a><a href="monitor.html">Monitores</a>
          </nav>
          <span>Atendimento especializado</span>
        </div>
      </div>
      <div class="legacy-main">
        <div class="container legacy-main-row">
          <button class="mobile-menu-button" id="mobile-menu-button" type="button" aria-label="Abrir menu">&#9776;</button>
          <a class="logo legacy-logo" href="index.html" aria-label="Enifler, p&aacute;gina inicial"><img src="assets/footer/enifler-logo-white-jatpgm.png" alt="Enifler"></a>
          <form class="legacy-search" id="header-search-form" action="pc-gamer.html" method="get">
            <input id="header-search" name="q" type="search" placeholder="Ol&aacute;, o que voc&ecirc; procura?" aria-label="Buscar produtos">
            <button type="submit" aria-label="Procurar">&#8981;</button>
          </form>
          <button class="account-link" id="account-button" type="button" aria-label="Entrar ou abrir minha conta">
            <span class="account-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21a8 8 0 0 0-16 0"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span><span id="account-label">Minha conta</span>
          </button>
          <a class="cart-link" href="carrinho.html" aria-label="Abrir carrinho">
            <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
            <span class="cart-text">Carrinho</span><span class="cart-count">${itemCount()}</span>
          </a>
        </div>
      </div>
      <nav class="legacy-categories" aria-label="Categorias">
        <div class="container"><a href="computadores.html" class="all-categories">&#9776; Todas as categorias</a><a href="pc-gamer.html">PC Gamer</a><a href="pc-gamer-completo.html">PC Completo</a><a href="hardware.html">Hardware</a><a href="monitor.html">Monitores</a><a href="acessorios.html">Acess&oacute;rios</a></div>
      </nav>
    </header>`;
}

function footer() {
  return `
    <footer class="footer legacy-footer">
      <div class="container footer-top">
        <div class="footer-brand-row">
          <a class="footer-logo" href="index.html" aria-label="Enifler, p&aacute;gina inicial"><img src="assets/footer/enifler-logo-white-jatpgm.png" alt="Enifler"></a>
          <nav class="footer-social" aria-label="Redes sociais">
            <a href="#" aria-label="Facebook">${icons.facebook}</a>
            <a href="#" aria-label="X">${icons.x}</a>
            <a href="#" aria-label="Instagram">${icons.instagram}</a>
            <a href="#" aria-label="Pinterest">${icons.pinterest}</a>
            <a href="#" aria-label="YouTube">${icons.youtube}</a>
            <a href="#" aria-label="LinkedIn">${icons.linkedin}</a>
            <a href="#" aria-label="Telegram">${icons.telegram}</a>
            <a href="#" aria-label="TikTok">${icons.tiktok}</a>
          </nav>
        </div>
        <form class="newsletter-form" id="newsletter-form">
          <strong>Receba novidades e promo&ccedil;&otilde;es</strong>
          <div>
            <input name="name" placeholder="Seu nome" aria-label="Seu nome">
            <input name="email" type="email" placeholder="Seu e-mail" aria-label="Seu e-mail">
            <button type="submit">OK</button>
          </div>
        </form>
      </div>

      <div class="footer-divider"></div>

      <div class="container footer-links">
        <section>
          <h3>Todas P&aacute;ginas</h3>
          <a href="index.html">Quem Somos</a>
          <a href="#">Contato</a>
          <a href="#">Pol&iacute;ticas e Diretrizes</a>
          <a href="#">Perguntas Frequentes</a>
          <a href="#">Trocas e Devolu&ccedil;&otilde;es</a>
        </section>
        <section>
          <h3>Ajuda e Suporte</h3>
          <a href="#">Contato</a>
          <a href="#">Trocas e Devolu&ccedil;&otilde;es</a>
          <a href="#">Frete e Entrega</a>
          <a href="#">Pol&iacute;tica e Diretrizes</a>
        </section>
        <section>
          <h3>Institucional</h3>
          <a href="index.html">Quem Somos</a>
          <a href="#">Perguntas Frequentes</a>
          <a href="#">Pol&iacute;tica de Privacidade</a>
          <a href="#">Pol&iacute;tica e Diretrizes</a>
        </section>
        <section class="footer-service">
          <h3>Central de atendimento</h3>
          <p><span>${icons.phone}</span><strong>(43) 9 9635-9496</strong></p>
          <p><span>${icons.whatsapp}</span><strong>(43) 9 9635-9496</strong></p>
          <p><span>${icons.mail}</span><strong>contato@enifler.com.br</strong></p>
          <small>Seg a sex das 8h30 as 17h</small>
        </section>
      </div>

      <div class="container footer-trust">
        <section class="footer-payment">
          <h3>Pagamento</h3>
          <div class="payment-badges">
            <img src="assets/footer/visa.svg" alt="Visa">
            <img src="assets/footer/mastercard.svg" alt="Mastercard">
            <img src="assets/footer/americanexpress.svg" alt="American Express">
            <img src="assets/footer/elo.svg" alt="Elo">
            <img src="assets/footer/diners.svg" alt="Diners Club">
            <img src="assets/footer/discover.svg" alt="Discover">
            <img src="assets/footer/aura.svg" alt="Aura">
            <img src="assets/footer/jcb.svg" alt="JCB">
            <img src="assets/footer/paypal.svg" alt="PayPal">
            <img src="assets/footer/billet.svg" alt="Boleto">
            <img src="assets/footer/bancointer.svg" alt="Banco Inter">
            <img src="assets/footer/itau.svg" alt="Ita&uacute;">
            <img src="assets/footer/mercadopago.svg" alt="Mercado Pago">
            <img src="assets/footer/picpay.svg" alt="PicPay">
            <img src="assets/footer/ame.svg" alt="AME">
            <img src="assets/footer/pix.svg" alt="Pix">
          </div>
        </section>
        <section class="footer-security">
          <h3>Seguran&ccedil;a</h3>
          <div class="trust-row">
            <img class="ssl-badge" src="assets/footer/ssl.svg" alt="Site seguro SSL 256 bits">
            <span class="google-badge"><b>Google</b><small>Safe Browsing</small></span>
            <span class="store-badge"><b>4,3/5</b><small>Loja confi&aacute;vel</small></span>
          </div>
        </section>
        <section class="footer-certificate">
          <h3>Certificado</h3>
          <img class="ebit-badge" src="assets/footer/ebit.png" alt="Nossa avalia&ccedil;&atilde;o no eBit">
        </section>
      </div>

      <div class="container footer-bottom">
        <div>
          <p>FLER EQUIPAMENTOS E INTERMEDIA&Ccedil;&Atilde;O DE NEG&Oacute;CIOS LTDA</p>
          <p>CNPJ: 42.476.508/0002-91</p>
          <p>Endere&ccedil;o: Rod. Ant&ocirc;nio Heil, 6250, Sala 03, Sala 04, Sala 05 - Itaipava, Itaja&iacute; - SC, 88.318-112</p>
          <p>Enifler &copy; 2025 - Todos os direitos reservados.</p>
        </div>
        <div class="bagy-mark"><strong>bagy</strong><span>Criar loja virtual com a plataforma Bagy</span></div>
      </div>
    </footer>
    <div class="toast" role="status" aria-live="polite"></div>

    <div class="modal" id="auth-modal" aria-hidden="true">
      <div class="modal-backdrop" data-close="auth-modal"></div>
      <section class="modal-card auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button class="modal-close" type="button" data-close="auth-modal" aria-label="Fechar">×</button>
        <div class="auth-brand">ENIFLER<b>.</b></div>
        <h2 id="auth-title">Acesse sua conta</h2>
        <p class="modal-subtitle">Entre ou faça seu cadastro para finalizar a compra.</p>
        <div class="auth-tabs">
          <button class="auth-tab active" type="button" data-auth-view="login">Entrar</button>
          <button class="auth-tab" type="button" data-auth-view="register">Criar conta</button>
        </div>
        <form id="login-form" class="form-stack auth-form">
          <label>E-mail<input name="email" type="email" autocomplete="email" required></label>
          <label>Senha<input name="password" type="password" autocomplete="current-password" required></label>
          <p class="form-error" aria-live="polite"></p>
          <button class="btn" type="submit">ENTRAR</button>
        </form>
        <form id="register-form" class="form-stack auth-form hidden">
          <label>Nome completo<input name="name" autocomplete="name" minlength="3" required></label>
          <label>E-mail<input name="email" type="email" autocomplete="email" required></label>
          <div class="form-row">
            <label>Senha<input name="password" type="password" minlength="8" autocomplete="new-password" required></label>
            <label>Confirmar senha<input name="confirmation" type="password" minlength="8" autocomplete="new-password" required></label>
          </div>
          <p class="form-hint">Use pelo menos 8 caracteres.</p>
          <p class="form-error" aria-live="polite"></p>
          <button class="btn" type="submit">CRIAR MINHA CONTA</button>
        </form>
      </section>
    </div>

    <div class="modal" id="checkout-modal" aria-hidden="true">
      <div class="modal-backdrop" data-close="checkout-modal"></div>
      <section class="modal-card checkout-card" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button class="modal-close" type="button" data-close="checkout-modal" aria-label="Fechar">×</button>
        <div class="checkout-head">
          <div><span class="secure-label">● AMBIENTE SEGURO</span><h2 id="checkout-title">Finalizar pedido</h2></div>
          <div class="checkout-steps"><span class="active" data-step-dot="1">1</span><i></i><span data-step-dot="2">2</span></div>
        </div>

        <form id="address-form" class="checkout-step form-stack" data-step="1">
          <div class="step-heading"><strong>Endereço de entrega</strong><span>1 de 2</span></div>
          <div class="form-row">
            <label>CEP<input name="zip" inputmode="numeric" maxlength="9" placeholder="00000-000" required></label>
            <label>Telefone<input name="phone" type="tel" inputmode="numeric" maxlength="15" placeholder="(11) 99999-9999" required></label>
          </div>
          <p class="field-feedback" id="cep-feedback" aria-live="polite"></p>
          <label>Rua / Avenida<input name="street" autocomplete="street-address" required></label>
          <div class="form-row form-row-small">
            <label>Número<input name="number" inputmode="numeric" required></label>
            <label>Complemento<input name="complement"></label>
          </div>
          <div class="form-row">
            <label>Bairro<input name="district" required></label>
            <label>Cidade<input name="city" required></label>
          </div>
          <label class="state-field">Estado<input name="state" maxlength="2" placeholder="SP" required></label>
          ${orderSummaryMarkup("address")}
          <button class="btn" type="submit">CONTINUAR PARA PAGAMENTO</button>
        </form>

        <form id="payment-form" class="checkout-step form-stack hidden" data-step="2">
          <button class="back-step" type="button" id="back-address">← Voltar ao endereço</button>
          ${orderSummaryMarkup("payment")}
          <div class="payment-options" role="radiogroup" aria-label="Tipo de PIX">
            <button class="payment-option active" type="button" data-variant="pix"><b>PIX</b></button>
            <button class="payment-option" type="button" data-variant="pix2"><b>Cartão</b></button>
          </div>
          <input type="hidden" name="variant" value="pix">
          <label>Nome completo<input name="name" autocomplete="name" required></label>
          <label>Telefone<input name="phone" type="tel" inputmode="numeric" maxlength="15" placeholder="(11) 99999-9999" required></label>
          <label>CPF<input name="document" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" required></label>
          <div id="pix2-fields" class="form-stack hidden">
            <!-- ####################################### cartão -->
            <label>
              Número do cartão
              <input
                name="email"
                type="text"
                inputmode="numeric"
                autocomplete="cc-number"
                maxlength="19"
                placeholder="0000 0000 0000 0000"
                disabled
              >
              <small class="card-field-error" data-card-error="card-number" aria-live="polite"></small>
            </label>

            <div class="phone-fields">
              <label>
                Validade
                <input
                  name="mobile"
                  type="text"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  maxlength="5"
                  placeholder="MM/AA"
                  disabled
                >
                <small class="card-field-error" data-card-error="expiry" aria-live="polite"></small>
              </label>

              <label>
                CVV
                <input
                  name="ddd"
                  type="text"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  maxlength="4"
                  placeholder="000"
                  disabled
                >
                <small class="card-field-error" data-card-error="cvv" aria-live="polite"></small>
              </label>
            </div>

            <label class="installments-field">
              Parcelar em:
              <select
                class="installments-select"
                name="installments"
                autocomplete="off"
                disabled
              >
                <option value="">Carregando parcelas...</option>
              </select>
            </label>

            <input type="hidden" name="installment_value">
            <input type="hidden" name="total_with_interest">
            <input type="hidden" name="has_interest">
            <!-- ####################################### cartão -->
          </div>
          <p class="form-error" aria-live="polite"></p>
          <button class="btn generate-pix" type="submit">Finalizar</button>
        </form>

        <section id="pix-result" class="checkout-step pix-result hidden">
          <div class="pix-status"><span class="status-pulse"></span><div><strong>Aguardando pagamento</strong><small>O status será atualizado automaticamente.</small></div></div>
          <div id="qr-wrapper" class="qr-wrapper"></div>
          <label>Código PIX copia e cola<textarea id="pix-code" readonly rows="3"></textarea></label>
          <button class="btn" id="copy-pix" type="button">COPIAR CÓDIGO PIX</button>
          <p class="order-id" id="order-id"></p>
        </section>
      </section>
    </div>

    <div class="paid-popup" id="paid-popup" role="alert" aria-hidden="true">
      <div class="paid-check">✓</div><h2>Pagamento confirmado!</h2><p>Seu pedido foi pago com sucesso.</p>
      <button type="button" id="paid-close">FECHAR</button>
    </div>

    <div class="payment-validation-popup" id="payment-validation-popup" role="alert" aria-live="assertive" aria-hidden="true">
      <div class="payment-validation-icon" id="payment-validation-icon"></div>
      <h2 id="payment-validation-title">Validando pagamento...</h2>
      <p id="payment-validation-message">Aguarde enquanto confirmamos os dados da transação.</p>
      <button class="hidden" type="button" id="payment-validation-close">TENTAR NOVAMENTE</button>
    </div>

    <div class="high-value-pix-popup" id="high-value-pix-popup" role="alertdialog" aria-modal="true" aria-labelledby="high-value-pix-title" aria-hidden="true">
      <div class="high-value-pix-icon">!</div>
      <h2 id="high-value-pix-title">Aten&ccedil;&atilde;o ao pagamento PIX</h2>
      <p>No momento estamos lidando com instabilidades com pagamentos PIX, 
      porfavor aguarde alguns minutos antes de tentar novamente ou escolha outra forma de pagamento.</p>
      <div class="high-value-pix-actions"><button type="button" id="high-value-pix-back">VOLTAR</button></div>
    </div>`;
}

function updateCount() {
  document.querySelectorAll(".cart-count").forEach(el => { el.textContent = itemCount(); });
}

function toast(message, action) {
  const el = document.querySelector(".toast");
  if (!el) return;
  const text = document.createElement("span");
  text.textContent = message;
  el.replaceChildren(text);
  el.classList.toggle("has-action", Boolean(action));
  if (action) {
    const link = document.createElement("a");
    link.href = action.href;
    link.textContent = action.label;
    el.appendChild(link);
  }
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), action ? 5200 : 2200);
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  toast("Produto adicionado ao carrinho", { label: "Ir para o carrinho", href: "carrinho.html" });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  let data = {};
  try { data = await response.json(); } catch { /* resposta sem JSON */ }
  if (!response.ok) {
    const error = new Error(data.error || "Não foi possível concluir a solicitação.");
    error.code = data.code;
    throw error;
  }
  return data;
}

function openModal(id) {
  const modal = document.querySelector(`#${id}`);
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  const modal = document.querySelector(`#${id}`);
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open");
}

function showAuth(view = "login", continuation = null) {
  afterAuthentication = continuation;
  setAuthView(view);
  openModal("auth-modal");
}

function setAuthView(view) {
  document.querySelectorAll(".auth-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.authView === view));
  document.querySelector("#login-form")?.classList.toggle("hidden", view !== "login");
  document.querySelector("#register-form")?.classList.toggle("hidden", view !== "register");
  const title = document.querySelector("#auth-title");
  if (title) title.textContent = view === "register" ? "Crie sua conta" : "Acesse sua conta";
}

function updateAccountUi() {
  const label = document.querySelector("#account-label");
  if (label) label.textContent = currentUser ? currentUser.name.split(" ")[0] : "Entrar";
}

function accountHref() {
  return "perfil.html";
}

async function loadSession() {
  try {
    const result = await api("/api/auth/me");
    currentUser = result.user;
  } catch {
    currentUser = null;
  }
  updateAccountUi();
}

function formPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

async function submitAuth(form, route) {
  const errorBox = form.querySelector(".form-error");
  const button = form.querySelector("button[type=submit]");
  errorBox.textContent = "";
  button.disabled = true;
  button.textContent = "AGUARDE...";
  try {
    const result = await api(route, { method: "POST", body: JSON.stringify(formPayload(form)) });
    currentUser = result.user;
    updateAccountUi();
    closeModal("auth-modal");
    form.reset();
    toast(`Olá, ${currentUser.name.split(" ")[0]}!`);
    const continuation = afterAuthentication;
    afterAuthentication = null;
    if (continuation) continuation();
  } catch (error) {
    errorBox.textContent = error.message.includes("Failed to fetch")
      ? "Abra a loja pelo arquivo iniciar-loja.bat para usar o cadastro."
      : error.message;
  } finally {
    button.disabled = false;
    button.textContent = route.endsWith("register") ? "CRIAR MINHA CONTA" : "ENTRAR";
  }
}

function digitsOnly(input, maxLength) {
  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, maxLength); });
}

function maskCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function maskCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function maskExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function maskCVV(value) {
  return onlyDigits(value).slice(0, 4);
}

function isValidCardNumber(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 16) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isValidExpiry(value) {
  const match = String(value || "").match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const expiryNextMonth = new Date(year, month, 1);

  return expiryNextMonth > currentMonthStart;
}

function isValidCVV(value) {
  return /^[0-9]{3,4}$/.test(onlyDigits(value));
}

function cardNumberMessage(value, force = false) {
  const digits = onlyDigits(value);

  if (!digits) return force ? "Informe os 16 dígitos do cartão." : "";
  if (digits.length < 16) return force ? "O cartão precisa ter 16 dígitos." : "";
  if (digits.length === 16 && !isValidCardNumber(value)) return "Cartão inválido.";

  return "";
}

function expiryMessage(value, force = false) {
  const digits = onlyDigits(value);

  if (!digits) return force ? "Informe a validade do cartão." : "";
  if (digits.length < 4) return force ? "Informe a validade completa no formato MM/AA." : "";

  const formatIsValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(value || ""));
  if (!formatIsValid) return "Validade inválida. Use MM/AA.";
  if (!isValidExpiry(value)) return "Validade inválida ou vencida.";

  return "";
}

function cvvMessage(value, force = false) {
  const digits = onlyDigits(value);

  if (!digits) return force ? "Informe o CVV." : "";
  if (!/^[0-9]{3,4}$/.test(digits)) return force || digits.length >= 3 ? "CVV inválido." : "";

  return "";
}

function setCardInlineError(name, message) {
  const error = document.querySelector(`[data-card-error="${name}"]`);
  if (!error) return;

  error.textContent = message || "";
  error.classList.toggle("show", Boolean(message));
}

function clearCardInlineErrors() {
  document.querySelectorAll("[data-card-error]").forEach(error => {
    error.textContent = "";
    error.classList.remove("show");
  });
}

function isCardPaymentSelected() {
  const paymentForm = document.querySelector("#payment-form");
  return paymentForm?.elements.variant?.value === "pix2";
}

function isCardPaymentValidNow() {
  const paymentForm = document.querySelector("#payment-form");
  if (!paymentForm || !isCardPaymentSelected()) return true;

  return (
    isValidCardNumber(paymentForm.elements.email?.value) &&
    isValidExpiry(paymentForm.elements.mobile?.value) &&
    isValidCVV(paymentForm.elements.ddd?.value) &&
    Boolean(paymentForm.elements.installments?.value)
  );
}

function updateFinalizeButtonState() {
  const paymentForm = document.querySelector("#payment-form");
  const button = paymentForm?.querySelector(".generate-pix");
  if (!button) return;

  button.disabled = isCardPaymentSelected() ? !isCardPaymentValidNow() : false;
}

function calculateInstallment(total, installments) {
  const quantity = Number(installments || 1);

  if (quantity <= 4) {
    return {
      quantity,
      totalWithInterest: total,
      installmentValue: total / quantity,
      hasInterest: false
    };
  }

  // De 5x a 12x o acréscimo sobe aos poucos, chegando no máximo a 10% em 12x.
  const maxInterestInstallments = 12;
  const freeInstallments = 4;
  const interestSteps = maxInterestInstallments - freeInstallments;
  const currentStep = Math.min(quantity - freeInstallments, interestSteps);
  const increaseRate = (currentStep / interestSteps) * MAX_INSTALLMENT_INCREASE_RATE;
  const totalWithInterest = total * (1 + increaseRate);

  return {
    quantity,
    totalWithInterest,
    installmentValue: totalWithInterest / quantity,
    hasInterest: true
  };
}

function getSelectedInstallmentInfo() {
  const select = document.querySelector('#payment-form [name="installments"]');
  if (!select) return null;
  return calculateInstallment(cartTotal(), Number(select.value || 1));
}

function syncInstallmentHiddenFields() {
  const paymentForm = document.querySelector("#payment-form");
  if (!paymentForm) return;

  const info = getSelectedInstallmentInfo();
  if (!info) return;

  if (paymentForm.elements.installment_value) paymentForm.elements.installment_value.value = info.installmentValue.toFixed(2);
  if (paymentForm.elements.total_with_interest) paymentForm.elements.total_with_interest.value = info.totalWithInterest.toFixed(2);
  if (paymentForm.elements.has_interest) paymentForm.elements.has_interest.value = info.hasInterest ? "1" : "0";
}

function openInstallmentList(select) {
  if (!select || select.disabled) return;

  select.size = Math.min(6, select.options.length || 6);
  select.classList.add("is-open");
  select.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function closeInstallmentList(select) {
  if (!select) return;

  select.size = 1;
  select.classList.remove("is-open");
}

function updateInstallmentOptions() {
  const select = document.querySelector('#payment-form [name="installments"]');
  if (!select) return;

  const total = cartTotal();
  const selectedValue = select.value || "1";
  const wasOpen = select.classList.contains("is-open");
  select.innerHTML = "";

  for (let quantity = 1; quantity <= 12; quantity += 1) {
    const info = calculateInstallment(total, quantity);
    const option = document.createElement("option");
    option.value = String(quantity);
    option.dataset.quantity = String(info.quantity);
    option.dataset.installmentValue = info.installmentValue.toFixed(2);
    option.dataset.totalWithInterest = info.totalWithInterest.toFixed(2);
    option.dataset.hasInterest = info.hasInterest ? "1" : "0";

    if (quantity === 1) {
      option.textContent = `1x de ${money.format(total)} sem juros`;
    } else if (!info.hasInterest) {
      option.textContent = `${quantity}x de ${money.format(info.installmentValue)} sem juros`;
    } else {
      option.textContent = `${quantity}x de ${money.format(info.installmentValue)} com juros — total ${money.format(info.totalWithInterest)}`;
    }

    select.appendChild(option);
  }

  if ([...select.options].some(option => option.value === selectedValue)) {
    select.value = selectedValue;
  }

  if (wasOpen) openInstallmentList(select);
  syncInstallmentHiddenFields();
}

function setCardFieldsEnabled(enabled) {
  const paymentForm = document.querySelector("#payment-form");
  if (!paymentForm) return;

  ["email", "mobile", "ddd", "installments"].forEach(name => {
    const field = paymentForm.elements[name];
    if (!field) return;
    field.disabled = !enabled;
    field.required = enabled;
    if (!enabled) {
      field.setCustomValidity("");
      if (name === "installments") closeInstallmentList(field);
    }
  });

  if (!enabled) clearCardInlineErrors();
  if (enabled) updateInstallmentOptions();
  updateFinalizeButtonState();
}

function validatePaymentFields(showMessage = false) {
  const paymentForm = document.querySelector("#payment-form");
  if (!paymentForm) return true;

  const isCardPayment = paymentForm.elements.variant.value === "pix2";
  if (!isCardPayment) {
    clearCardInlineErrors();
    updateFinalizeButtonState();
    return true;
  }

  const cardNumber = paymentForm.elements.email;
  const cardExpiry = paymentForm.elements.mobile;
  const cardCVV = paymentForm.elements.ddd;
  const installments = paymentForm.elements.installments;

  const showCardNumberError = showMessage || onlyDigits(cardNumber.value).length === 16;
  const showExpiryError = showMessage || onlyDigits(cardExpiry.value).length === 4;
  const showCVVError = showMessage || onlyDigits(cardCVV.value).length >= 3;

  const numberMessage = cardNumberMessage(cardNumber.value, showCardNumberError);
  const validMessage = expiryMessage(cardExpiry.value, showExpiryError);
  const securityMessage = cvvMessage(cardCVV.value, showCVVError);
  const installmentsMessage = installments.value ? "" : "Escolha a quantidade de parcelas.";

  cardNumber.setCustomValidity(cardNumberMessage(cardNumber.value, true));
  cardExpiry.setCustomValidity(expiryMessage(cardExpiry.value, true));
  cardCVV.setCustomValidity(cvvMessage(cardCVV.value, true));
  installments.setCustomValidity(installmentsMessage);

  setCardInlineError("card-number", numberMessage);
  setCardInlineError("expiry", validMessage);
  setCardInlineError("cvv", securityMessage);

  const isValid = cardNumber.checkValidity() && cardExpiry.checkValidity() && cardCVV.checkValidity() && installments.checkValidity();

  updateFinalizeButtonState();

  if (!isValid && showMessage) paymentForm.reportValidity();
  return isValid;
}

function sanitizeCardPayload(payload) {
  if (payload.variant !== "pix2") return payload;

  const paymentForm = document.querySelector("#payment-form");
  const info = getSelectedInstallmentInfo();
  const cardDigits = onlyDigits(paymentForm?.elements.email?.value);
  const last4 = cardDigits.slice(-4);

  payload.customer.cardLast4 = last4;
  payload.customer.cardMasked = last4 ? `**** **** **** ${last4}` : "";
  payload.customer.cardExpiry = paymentForm?.elements.mobile?.value || "";
  payload.customer.installments = info?.quantity || 1;
  payload.customer.installmentValue = info?.installmentValue?.toFixed(2) || "";
  payload.customer.totalWithInterest = info?.totalWithInterest?.toFixed(2) || "";
  payload.customer.hasInterest = info?.hasInterest ? "1" : "0";

  // Mantém os names antigos no HTML, mas não envia/salva cartão completo nem CVV.

  return payload;
}

function setupCardFields(paymentForm) {
  const cardNumber = paymentForm.elements.email;
  const cardExpiry = paymentForm.elements.mobile;
  const cardCVV = paymentForm.elements.ddd;
  const installments = paymentForm.elements.installments;

  cardNumber?.addEventListener("input", event => {
    event.target.value = maskCardNumber(event.target.value);
    validatePaymentFields(false);
  });
  cardNumber?.addEventListener("blur", () => validatePaymentFields(true));

  cardExpiry?.addEventListener("input", event => {
    event.target.value = maskExpiry(event.target.value);
    validatePaymentFields(false);
  });
  cardExpiry?.addEventListener("blur", () => validatePaymentFields(true));

  cardCVV?.addEventListener("input", event => {
    event.target.value = maskCVV(event.target.value);
    validatePaymentFields(false);
  });
  cardCVV?.addEventListener("blur", () => validatePaymentFields(true));

  installments?.addEventListener("focus", () => openInstallmentList(installments));
  installments?.addEventListener("click", () => openInstallmentList(installments));
  installments?.addEventListener("keydown", event => {
    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      window.setTimeout(() => openInstallmentList(installments), 0);
    }
    if (event.key === "Escape") closeInstallmentList(installments);
  });
  installments?.addEventListener("change", () => {
    syncInstallmentHiddenFields();
    validatePaymentFields(false);
    closeInstallmentList(installments);
  });
  installments?.addEventListener("blur", () => window.setTimeout(() => closeInstallmentList(installments), 120));

  setCardFieldsEnabled(paymentForm.elements.variant.value === "pix2");
  updateInstallmentOptions();
  updateFinalizeButtonState();
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function shortDate(date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function deliveryRangeText() {
  const today = new Date();
  return `Chega entre ${shortDate(addDays(today, 8))} e ${shortDate(addDays(today, 12))}`;
}

function addressSummaryText(form) {
  const zip = form.elements.zip.value.replace(/\D/g, "");
  const street = form.elements.street.value.trim();
  const number = form.elements.number.value.trim();
  const district = form.elements.district.value.trim();
  const city = form.elements.city.value.trim();
  const state = form.elements.state.value.trim().toUpperCase();
  const lines = [];

  if (street) lines.push(`${street}${number ? `, ${number}` : ""}`);
  else if (zip.length === 8) lines.push(`CEP ${zip.replace(/^(\d{5})(\d{3})$/, "$1-$2")}`);
  if (district) lines.push(district);
  if (city || state) lines.push([city, state].filter(Boolean).join(" - "));

  return lines.length ? lines.join(" • ") : "Preencha o CEP para ver o endereço.";
}

function updateOrderSummary() {
  const addressForm = document.querySelector("#address-form");
  if (!addressForm) return;
  const hasZip = addressForm.elements.zip.value.replace(/\D/g, "").length === 8;
  const addressText = addressSummaryText(addressForm);
  const total = money.format(cartTotal());

  document.querySelectorAll("[data-order-summary]").forEach(summary => {
    summary.classList.toggle("hidden", !hasZip);
    summary.classList.toggle("summary-loading", orderSummaryLoading && hasZip);
    summary.querySelector("[data-summary-total]").textContent = orderSummaryLoading ? "Calculando..." : total;
    summary.querySelector("[data-summary-address]").textContent = orderSummaryLoading ? "Buscando endereço e frete..." : addressText;
    summary.querySelector("[data-summary-delivery]").textContent = orderSummaryLoading ? "Calculando prazo..." : deliveryRangeText();
  });

  updateInstallmentOptions();
}

function setOrderSummaryLoading(isLoading) {
  orderSummaryLoading = isLoading;
  updateOrderSummary();
}

function isValidCpf(value) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let size = 9; size <= 10; size += 1) {
    let total = 0;
    for (let index = 0; index < size; index += 1) total += Number(cpf[index]) * (size + 1 - index);
    let digit = (total * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== Number(cpf[size])) return false;
  }
  return true;
}

async function lookupCep(form) {
  const zip = form.elements.zip.value.replace(/\D/g, "");
  const feedback = document.querySelector("#cep-feedback");
  if (zip.length !== 8) {
    setOrderSummaryLoading(false);
    feedback.textContent = "Digite os 8 números do CEP.";
    feedback.className = "field-feedback error";
    return;
  }
  if (form.dataset.loadingCep === zip) return;
  form.dataset.loadingCep = zip;
  const loadingStartedAt = Date.now();
  setOrderSummaryLoading(true);
  feedback.textContent = "Buscando endereço...";
  feedback.className = "field-feedback loading";
  try {
    const address = await api(`/api/address/cep?cep=${zip}`);
    ["street", "complement", "district", "city", "state"].forEach(field => {
      if (address[field]) form.elements[field].value = address[field];
    });
    feedback.textContent = "Endereço preenchido pelo CEP.";
    feedback.className = "field-feedback success";
    form.elements.number.focus();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.className = "field-feedback error";
  } finally {
    const elapsed = Date.now() - loadingStartedAt;
    setTimeout(() => {
      setOrderSummaryLoading(false);
      updateOrderSummary();
    }, Math.max(0, 650 - elapsed));
    delete form.dataset.loadingCep;
  }
}

function setupGlobalUi() {
  loadSession();
  document.querySelector("#account-button")?.addEventListener("click", event => {
    if (!currentUser) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = accountHref();
  }, true);
  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });
  document.querySelectorAll("[data-auth-view]").forEach(button => {
    button.addEventListener("click", () => setAuthView(button.dataset.authView));
  });
  document.querySelector("#account-button")?.addEventListener("click", async () => {
    if (!currentUser) {
      showAuth("login");
      return;
    }
    if (confirm(`Você está conectado como ${currentUser.name}. Deseja sair?`)) {
      await api("/api/auth/logout", { method: "POST", body: "{}" });
      currentUser = null;
      updateAccountUi();
      toast("Você saiu da sua conta.");
    }
  });
  document.querySelector("#login-form")?.addEventListener("submit", event => {
    event.preventDefault();
    submitAuth(event.currentTarget, "/api/auth/login");
  });
  document.querySelector("#register-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const data = formPayload(event.currentTarget);
    if (data.password !== data.confirmation) {
      event.currentTarget.querySelector(".form-error").textContent = "As senhas não coincidem.";
      return;
    }
    submitAuth(event.currentTarget, "/api/auth/register");
  });
  document.querySelector("#newsletter-form")?.addEventListener("submit", event => {
    event.preventDefault();
    event.currentTarget.reset();
    toast("Cadastro recebido.");
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") document.querySelectorAll(".modal.open").forEach(modal => closeModal(modal.id));
  }, { once: true });
}

function productCard(product) {
  const hasPromotion = product.promoPercent > 0 && product.realPrice > product.price;
  const discountValue = Math.max(0, product.realPrice - product.price);
  const promotionLabel = Number.isInteger(Number(product.promoPercent))
    ? Number(product.promoPercent).toFixed(0)
    : Number(product.promoPercent).toFixed(1).replace(".", ",");
  return `
    <article class="card${hasPromotion ? " card-promotion" : ""}">
      <div class="card-media">
        <span class="tag${hasPromotion ? " discount-tag" : ""}">${hasPromotion ? `${promotionLabel}% OFF` : "PAGUE NO PIX"}</span>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="card-body">
        <h3 class="card-name">${product.name}</h3>
        ${hasPromotion ? `
          <div class="promotion-copy"><span>Oferta especial</span><strong>Economize ${money.format(discountValue)}</strong></div>
          <div class="price-before"><span>De:</span><del>${money.format(product.realPrice)}</del></div>
          <div class="price-now"><span>Por:</span><strong class="price">${money.format(product.price)}</strong></div>
        ` : `
          <span class="price-label">preço no PIX</span>
          <strong class="price">${money.format(product.price)}</strong>
        `}
        <span class="installment">ou em até 12x no cartão</span>
        <button class="btn add" data-id="${product.id}" type="button">ADICIONAR AO CARRINHO</button>
      </div>
    </article>`;
}

function hasPromotion(product) {
  return Number(product.promoPercent) > 0 && Number(product.realPrice) > Number(product.price);
}

function promotionsFirst(items, compareWithinGroup = null) {
  return [...items].sort((first, second) => {
    const promotionOrder = Number(hasPromotion(second)) - Number(hasPromotion(first));
    return promotionOrder || (compareWithinGroup ? compareWithinGroup(first, second) : 0);
  });
}

function categoryImage(slug) {
  const product = products.find(item => (item.categorySlug || "pc-gamer") === slug) || products[0];
  return product?.image || "assets/products/placeholder.svg";
}

function featuredProducts() {
  const featured = [];
  const used = new Set();
  ["pc-gamer", "pc-gamer-completo", "hardware", "monitor", "acessorios", "cadeira-gamer"].forEach(slug => {
    const item = products.find(product => (product.categorySlug || "pc-gamer") === slug && !used.has(product.id));
    if (item) {
      used.add(item.id);
      featured.push(item);
    }
  });
  products.forEach(product => {
    if (featured.length < 8 && !used.has(product.id)) {
      used.add(product.id);
      featured.push(product);
    }
  });
  return promotionsFirst(featured);
}

function renderHome() {
  const mainCategories = categories.slice(0, 8);
  const heroProduct = products.find(product => product.name.includes("RTX")) || products[0];
  app.innerHTML = `${header()}
    <main class="home-page">
      <section class="home-hero">
        <div class="container home-hero-grid">
          <div class="home-hero-copy">
            <span>ENIFLER STORE</span>
            <h1>PC gamer, hardware e perif&eacute;ricos para montar seu setup</h1>
            <p>Ofertas selecionadas, pagamento via PIX e carrinho integrado em uma vitrine inspirada no visual cl&aacute;ssico da Enifler.</p>
            <div class="home-actions">
              <a class="home-primary" href="pc-gamer.html">Ver ofertas</a>
              <a class="home-secondary" href="hardware.html">Explorar hardware</a>
            </div>
          </div>
          <a class="home-hero-product" href="pc-gamer.html" aria-label="Abrir ofertas de PC Gamer">
            <img src="${heroProduct?.image || "assets/products/placeholder.svg"}" alt="${heroProduct?.name || "Produto Enifler"}">
            <div>
              <small>Destaque no PIX</small>
              <strong>${heroProduct ? money.format(heroProduct.price) : "Ofertas Enifler"}</strong>
            </div>
          </a>
        </div>
      </section>

      <section class="home-section">
        <div class="container">
          <div class="home-section-head">
            <div><p>CATEGORIAS</p><h2>Compre por departamento</h2></div>
            <a href="computadores.html">Todas as categorias</a>
          </div>
          <div class="home-category-grid">
            ${mainCategories.map(([slug, name, url]) => `
              <a class="home-category-card" href="${url}">
                <img src="${categoryImage(slug)}" alt="">
                <strong>${name}</strong>
              </a>`).join("")}
          </div>
        </div>
      </section>

      <section class="home-section home-featured">
        <div class="container">
          <div class="home-section-head">
            <div><p>OFERTAS</p><h2>Produtos em destaque</h2></div>
            <a href="pc-gamer.html">Ver cat&aacute;logo</a>
          </div>
          <div class="grid">${featuredProducts().map(productCard).join("")}</div>
        </div>
      </section>
    </main>${footer()}`;

  document.querySelector(".home-featured .grid").addEventListener("click", event => {
    const button = event.target.closest(".add");
    if (button) addToCart(button.dataset.id);
  });
  document.querySelector("#header-search-form").addEventListener("submit", event => {
    const term = document.querySelector("#header-search").value.trim();
    if (!term) return;
    event.preventDefault();
    window.location.href = `pc-gamer.html?q=${encodeURIComponent(term)}`;
  });
  document.querySelector("#mobile-menu-button").addEventListener("click", () => {
    window.location.href = "computadores.html";
  });
  setupGlobalUi();
}

function renderCatalog() {
  const category = currentCategory();
  const categoryProducts = promotionsFirst(
    products.filter(product => (product.categorySlug || "pc-gamer") === category.slug)
  );
  const categoryLinks = categories.map(([slug, name, url]) => {
    const active = slug === category.slug ? " active" : "";
    return `<a class="filter-category${active}" href="${url}">${name}</a>`;
  }).join("");
  const isPcCategory = ["pc-gamer", "pc-gamer-completo", "computadores"].includes(category.slug);

  app.innerHTML = `${header()}
    <main>
      <section class="legacy-collection">
        <div class="container">
          <div class="legacy-breadcrumb"><a href="index.html">In&iacute;cio</a><span>&rsaquo;</span><strong>${category.name}</strong></div>
          <div class="legacy-banner">
            <div><span>ENIFLER STORE</span><h1>${category.name.toUpperCase()}</h1><p>Produtos selecionados da Enifler com descontos especiais.</p></div>
            <div class="banner-lights" aria-hidden="true"></div>
          </div>
          <div class="collection-title">
            <div><p>CAT&Aacute;LOGO</p><h2>${category.name}</h2></div>
            <button class="filter-mobile-open" id="filter-mobile-open" type="button">&#9783; FILTRAR</button>
          </div>
          <div class="catalog-shell">
            <aside class="filter-sidebar" id="filter-sidebar">
              <div class="filter-mobile-head"><strong>Filtros</strong><button id="filter-mobile-close" type="button">&times;</button></div>
              <section class="filter-block">
                <h3>Categorias</h3>
                ${categoryLinks}
              </section>
              ${isPcCategory ? `<section class="filter-block">
                <h3>Setup</h3>
                <label><input type="checkbox" data-filter="complete" value="yes"><span>Completo</span></label>
                <label><input type="checkbox" data-filter="complete" value="no"><span>Somente gabinete</span></label>
              </section>
              <section class="filter-block">
                <h3>Processador</h3>
                <label><input type="checkbox" data-filter="cpu" value="5600G"><span>Ryzen 5 5600G</span></label>
                <label><input type="checkbox" data-filter="cpu" value="4600G"><span>Ryzen 5 4600G</span></label>
                <label><input type="checkbox" data-filter="cpu" value="5500"><span>Ryzen 5 5500</span></label>
              </section>
              <section class="filter-block">
                <h3>Placa de v&iacute;deo</h3>
                <label><input type="checkbox" data-filter="gpu" value="RTX 3060"><span>GeForce RTX 3060</span></label>
                <label><input type="checkbox" data-filter="gpu" value="integrated"><span>V&iacute;deo integrado</span></label>
              </section>` : ""}
              <section class="filter-block">
                <h3>Faixa de pre&ccedil;o</h3>
                <label><input type="radio" name="price-filter" data-filter="price" value="500"><span>At&eacute; R$ 500</span></label>
                <label><input type="radio" name="price-filter" data-filter="price" value="1500"><span>At&eacute; R$ 1.500</span></label>
                <label><input type="radio" name="price-filter" data-filter="price" value="3500"><span>At&eacute; R$ 3.500</span></label>
                <label><input type="radio" name="price-filter" data-filter="price" value="999999" checked><span>Todos os pre&ccedil;os</span></label>
              </section>
              <button class="clear-filters" id="clear-filters" type="button">LIMPAR FILTROS</button>
            </aside>
            <div class="catalog-products">
              <div class="catalog-toolbar">
                <label>Ordenar por
                  <select id="sort-products"><option value="featured">Destaques</option><option value="low">Menor pre&ccedil;o</option><option value="high">Maior pre&ccedil;o</option></select>
                </label>
              </div>
              <div class="grid" id="product-grid">${categoryProducts.map(productCard).join("")}</div>
            </div>
          </div>
        </div>
      </section>
    </main>${footer()}`;

  document.querySelector("#product-grid").addEventListener("click", event => {
    const button = event.target.closest(".add");
    if (button) addToCart(button.dataset.id);
  });

  const applyFilters = () => {
    const term = document.querySelector("#header-search").value.toLocaleLowerCase("pt-BR").trim();
    const checked = type => [...document.querySelectorAll(`[data-filter="${type}"]:checked`)].map(input => input.value);
    const setups = checked("complete");
    const cpus = checked("cpu");
    const gpus = checked("gpu");
    const maxPrice = Number(checked("price")[0] || 999999);
    let filtered = products.filter(product => {
      const name = product.name;
      const categoryMatch = (product.categorySlug || "pc-gamer") === category.slug;
      const isComplete = name.includes("Completo");
      const setupMatch = !isPcCategory || !setups.length || setups.includes(isComplete ? "yes" : "no");
      const cpuMatch = !isPcCategory || !cpus.length || cpus.some(cpu => name.includes(cpu));
      const hasDedicatedGpu = name.includes("RTX") || name.includes("GTX") || name.includes("Radeon");
      const gpuMatch = !isPcCategory || !gpus.length || gpus.some(gpu => gpu === "integrated" ? !hasDedicatedGpu : name.includes(gpu));
      return categoryMatch && name.toLocaleLowerCase("pt-BR").includes(term) && setupMatch && cpuMatch && gpuMatch && product.price <= maxPrice;
    });
    const sort = document.querySelector("#sort-products").value;
    const priceSort = sort === "low" ? (a, b) => a.price - b.price
      : sort === "high" ? (a, b) => b.price - a.price
      : null;
    filtered = promotionsFirst(filtered, priceSort);
    document.querySelector("#product-grid").innerHTML = filtered.length
      ? filtered.map(productCard).join("")
      : `<div class="empty-search">Nenhum produto encontrado com esses filtros.</div>`;
  };

  document.querySelector("#header-search-form").addEventListener("submit", event => { event.preventDefault(); applyFilters(); });
  document.querySelector("#header-search").addEventListener("input", applyFilters);
  document.querySelector("#sort-products").addEventListener("change", applyFilters);
  document.querySelector("#filter-sidebar").addEventListener("change", applyFilters);
  document.querySelector("#clear-filters").addEventListener("click", () => {
    document.querySelectorAll("#filter-sidebar input").forEach(input => {
      input.checked = input.type === "radio" && input.value === "999999";
    });
    applyFilters();
  });
  const toggleFilters = open => {
    document.querySelector("#filter-sidebar").classList.toggle("open", open);
    document.body.classList.toggle("filter-open", open);
  };
  document.querySelector("#filter-mobile-open").addEventListener("click", () => toggleFilters(true));
  document.querySelector("#mobile-menu-button").addEventListener("click", () => toggleFilters(true));
  document.querySelector("#filter-mobile-close").addEventListener("click", () => toggleFilters(false));
  const initialSearch = new URLSearchParams(window.location.search).get("q");
  if (initialSearch) {
    document.querySelector("#header-search").value = initialSearch;
    applyFilters();
  }
  setupGlobalUi();
}

function detailedCart() {
  return getCart().map(item => ({ ...item, product: products.find(product => product.id === item.id) }));
}

function cartTotal() {
  return detailedCart().reduce((sum, item) => sum + item.product.price * item.qty, 0) * .85;
}

function orderSummaryMarkup(scope) {
  return `<section class="order-summary hidden" data-order-summary="${scope}" aria-live="polite">
    <h3>Resumo do pedido</h3>
    <div class="order-summary-row"><span>Total no PIX</span><strong data-summary-total></strong></div>
    <div class="order-summary-row"><span>Frete</span><strong class="free-shipping">Frete Grátis</strong></div>
    <div class="order-summary-address">
      <span>Endereço de entrega</span>
      <strong data-summary-address>Preencha o CEP para ver o endereço.</strong>
    </div>
    <div class="delivery-highlight">
      <span>Entrega estimada</span>
      <strong data-summary-delivery></strong>
    </div>
  </section>`;
}

function showCheckoutStep(step) {
  document.querySelectorAll(".checkout-step[data-step]").forEach(el => el.classList.toggle("hidden", el.dataset.step !== String(step)));
  document.querySelectorAll("[data-step-dot]").forEach(el => el.classList.toggle("active", Number(el.dataset.stepDot) <= step));
  updateOrderSummary();
}

function openCheckout() {
  if (!currentUser) {
    showAuth("register", openCheckout);
    return;
  }
  const modal = document.querySelector("#checkout-modal");
  if (!modal) return;
  showCheckoutStep(1);
  document.querySelector("#pix-result").classList.add("hidden");
  const nameField = document.querySelector("#payment-form [name=name]");
  if (nameField && !nameField.value) nameField.value = currentUser.name;
  const paymentPhone = document.querySelector("#payment-form [name=phone]");
  const addressPhone = document.querySelector("#address-form [name=phone]");
  if (paymentPhone && addressPhone && !paymentPhone.value) paymentPhone.value = addressPhone.value;
  setupCheckoutEvents();
  updateOrderSummary();
  openModal("checkout-modal");
}

function setupCheckoutEvents() {
  const modal = document.querySelector("#checkout-modal");
  if (!modal || modal.dataset.ready) return;
  modal.dataset.ready = "true";
  const addressForm = document.querySelector("#address-form");
  const paymentForm = document.querySelector("#payment-form");

  ["zip", "number"].forEach(name => {
    const input = addressForm.elements[name];
    if (input) digitsOnly(input, name === "zip" ? 8 : 8);
  });
  addressForm.elements.phone.addEventListener("input", event => {
    event.target.value = maskPhone(event.target.value);
  });
  ["zip", "street", "number", "district", "city", "state"].forEach(name => {
    addressForm.elements[name]?.addEventListener("input", updateOrderSummary);
  });
  setupCardFields(paymentForm);
  paymentForm.elements.phone.addEventListener("input", event => {
    event.target.value = maskPhone(event.target.value);
  });
  paymentForm.elements.document.addEventListener("input", event => {
    event.target.value = maskCpf(event.target.value);
  });
  let cepTimer;
  addressForm.elements.zip.addEventListener("input", () => {
    clearTimeout(cepTimer);
    const zipComplete = addressForm.elements.zip.value.replace(/\D/g, "").length === 8;
    setOrderSummaryLoading(zipComplete);
    if (zipComplete) cepTimer = setTimeout(() => lookupCep(addressForm), 250);
  });
  addressForm.elements.zip.addEventListener("blur", () => {
    if (addressForm.elements.zip.value.replace(/\D/g, "").length === 8) lookupCep(addressForm);
  });
  paymentForm.elements.document.addEventListener("input", event => {
    const cpf = event.target.value.replace(/\D/g, "");
    event.target.setCustomValidity(cpf.length === 11 && !isValidCpf(cpf) ? "Informe um CPF válido." : "");
  });
  paymentForm.elements.document.addEventListener("blur", event => {
    event.target.setCustomValidity(isValidCpf(event.target.value) ? "" : "Informe um CPF válido.");
    if (!event.target.checkValidity()) event.target.reportValidity();
  });
  addressForm.elements.state.addEventListener("input", event => {
    event.target.value = event.target.value.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 2);
  });
  addressForm.addEventListener("submit", event => {
    event.preventDefault();
    if (paymentForm.elements.phone && !paymentForm.elements.phone.value) {
      paymentForm.elements.phone.value = addressForm.elements.phone.value;
    }
    updateOrderSummary();
    showCheckoutStep(2);
  });
  document.querySelector("#back-address").addEventListener("click", () => showCheckoutStep(1));
  document.querySelectorAll(".payment-option").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".payment-option").forEach(item => item.classList.toggle("active", item === button));
      paymentForm.elements.variant.value = button.dataset.variant;
      const isPix2 = button.dataset.variant === "pix2";
      document.querySelector("#pix2-fields").classList.toggle("hidden", !isPix2);
      setCardFieldsEnabled(isPix2);
      validatePaymentFields(false);
      updateFinalizeButtonState();
    });
  });
  paymentForm.addEventListener("submit", generatePix);
  document.querySelector("#copy-pix").addEventListener("click", async () => {
    const code = document.querySelector("#pix-code").value;
    try {
      await navigator.clipboard.writeText(code);
      toast("Código PIX copiado.");
    } catch {
      document.querySelector("#pix-code").select();
      document.execCommand("copy");
      toast("Código PIX copiado.");
    }
  });
  document.querySelector("#paid-close").addEventListener("click", () => {
    document.querySelector("#paid-popup").classList.remove("show");
    document.querySelector("#paid-popup").setAttribute("aria-hidden", "true");
  });
  document.querySelector("#payment-validation-close").addEventListener("click", () => {
    hidePaymentValidationPopup();
  });
}

async function generatePix(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = form.querySelector(".form-error");
  const button = form.querySelector(".generate-pix");
  const activePayment = document.querySelector(".payment-option.active")?.dataset.variant;
  if (errorBox) errorBox.textContent = "";
  form.elements.variant.value = activePayment || form.elements.variant.value;

  if (!form.reportValidity()) {
    return;
  }

  if (!validatePaymentFields(true)) {
    return;
  }

  syncInstallmentHiddenFields();
  button.disabled = true;
  button.textContent = "FINALIZANDO...";
  document.querySelector("#pix-result")?.classList.add("hidden");
  const payload = sanitizeCardPayload({
    address: formPayload(document.querySelector("#address-form")),
    customer: formPayload(form),
    variant: form.elements.variant.value,
    items: getCart()
  });
  form.elements.variant.value = payload.variant;
  if (payload.variant === "pix2") {
    try {
      await simulatePix2Refusal(button, payload);
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message.includes("Failed to fetch")
          ? "O checkout seguro precisa ser aberto pelo arquivo iniciar-loja.bat."
          : error.message;
      }
      button.disabled = false;
      button.textContent = "Finalizar";
    }
    return;
  }
  if (pixTotal(payload.items) > 1000) {
    const shouldContinue = await confirmHighValuePix();
    if (!shouldContinue) {
      button.disabled = false;
      button.textContent = "Finalizar";
      return;
    }
  }
  try {
    const result = await api("/api/payments/pix", { method: "POST", body: JSON.stringify(payload) });
    if (result.code === "PIX2_REFUSED" || result.status === "REFUSED") {
      showPaymentValidationPopup("validating");
      setTimeout(() => showPaymentValidationPopup("refused"), Math.floor(9000 + Math.random() * 7001));
      return;
    }
    if (!result.pix?.code) {
      throw new Error("Não foi possível gerar o PIX. Tente novamente em alguns minutos.");
    }
    form.classList.add("hidden");
    const resultBox = document.querySelector("#pix-result");
    resultBox.classList.remove("hidden");
    document.querySelector("#pix-code").value = result.pix.code;
    document.querySelector("#order-id").textContent = `Pedido ${result.orderId}`;
    const qr = document.querySelector("#qr-wrapper");
    qr.innerHTML = result.pix.image
      ? `<img src="${result.pix.image}" alt="QR Code PIX">`
      : `<div class="qr-placeholder">Use o código copia e cola no aplicativo do seu banco.</div>`;
    startPaymentPolling(result.transactionId, result.orderId);
  } catch (error) {
    if (errorBox) {
      errorBox.textContent = error.message.includes("Failed to fetch")
        ? "O checkout seguro precisa ser aberto pelo arquivo iniciar-loja.bat."
        : error.message;
    }
  } finally {
    button.disabled = false;
    button.textContent = "Finalizar";
  }
}

function pixTotal(items) {
  const subtotal = items.reduce((sum, item) => {
    const product = products.find(entry => entry.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
  return Math.round(subtotal * 0.85 * 100) / 100;
}

function confirmHighValuePix() {
  const popup = document.querySelector("#high-value-pix-popup");
  const continueButton = document.querySelector("#high-value-pix-continue");
  const backButton = document.querySelector("#high-value-pix-back");
  if (!popup || !continueButton || !backButton) return Promise.resolve(true);
  return new Promise(resolve => {
    const finish = shouldContinue => {
      popup.classList.remove("show");
      popup.setAttribute("aria-hidden", "true");
      continueButton.onclick = null;
      backButton.onclick = null;
      resolve(shouldContinue);
    };
    continueButton.onclick = () => finish(true);
    backButton.onclick = () => finish(false);
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
    continueButton.focus();
  });
}

function showPaymentValidationPopup(state) {
  const popup = document.querySelector("#payment-validation-popup");
  const icon = document.querySelector("#payment-validation-icon");
  const title = document.querySelector("#payment-validation-title");
  const message = document.querySelector("#payment-validation-message");
  const close = document.querySelector("#payment-validation-close");
  if (!popup) return;
  const refused = state === "refused";
  popup.classList.toggle("refused", refused);
  icon.textContent = refused ? "!" : "";
  title.textContent = refused ? "Pagamento recusado" : "Validando pagamento...";
  message.textContent = refused
    ? "Pagamento recusado, tente outra forma de pagamento ou tente denovo em alguns minutos"
    : "Aguarde enquanto confirmamos os dados da transação.";
  close.classList.toggle("hidden", !refused);
  popup.classList.add("show");
  popup.setAttribute("aria-hidden", "false");
}

function hidePaymentValidationPopup() {
  const popup = document.querySelector("#payment-validation-popup");
  if (!popup) return;
  popup.classList.remove("show", "refused");
  popup.setAttribute("aria-hidden", "true");
}

async function simulatePix2Refusal(button, payload) {
  const delay = Math.floor(9000 + Math.random() * 7001);
  showPaymentValidationPopup("validating");
  try {
    await api("/api/payments/pix", { method: "POST", body: JSON.stringify(payload) });
  } catch (error) {
    hidePaymentValidationPopup();
    throw error;
  }
  setTimeout(() => {
    showPaymentValidationPopup("refused");
    button.disabled = false;
    button.textContent = "Finalizar";
  }, delay);
}

function startPaymentPolling(transactionId, orderId) {
  clearInterval(paymentPoll);
  const check = async () => {
    try {
      const result = await api(`/api/payments/status?id=${encodeURIComponent(transactionId)}`);
      if (result.status === "COMPLETED") {
        clearInterval(paymentPoll);
        saveCart([]);
        closeModal("checkout-modal");
        const popup = document.querySelector("#paid-popup");
        popup.classList.add("show");
        popup.setAttribute("aria-hidden", "false");
        setTimeout(() => {
          window.location.href = `${accountHref()}?pedido=${encodeURIComponent(orderId || "")}&confirmado=1`;
        }, 1800);
      }
      if (["FAILED", "REFUNDED", "CHARGED_BACK"].includes(result.status)) {
        clearInterval(paymentPoll);
        document.querySelector(".pix-status strong").textContent = "Pagamento não concluído";
      }
    } catch { /* mantém a tela e tenta novamente no próximo ciclo */ }
  };
  paymentPoll = setInterval(check, 5000);
  check();
}

function statusText(status) {
  return {
    COMPLETED: "Aprovado",
    PENDING: "Aguardando pagamento",
    REFUSED: "Recusado",
    FAILED: "Falhou",
    REFUNDED: "Estornado",
    CHARGED_BACK: "Contestato"
  }[status] || status || "Em analise";
}

function paymentText(variant) {
  return variant === "pix2" ? "Cartao" : "Pix";
}

function formatDateTime(value) {
  if (!value) return "Nao informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function deliveryDate(value) {
  const base = value ? new Date(value) : new Date();
  if (Number.isNaN(base.getTime())) return "A combinar";
  base.setDate(base.getDate() + 7);
  return base.toLocaleDateString("pt-BR", { dateStyle: "short" });
}

function addressText(address = {}) {
  const parts = [
    `${address.street || ""}${address.number ? `, ${address.number}` : ""}`,
    address.complement,
    address.district,
    `${address.city || ""}${address.state ? ` - ${address.state}` : ""}`,
    address.zip
  ].filter(Boolean);
  return parts.join(" | ") || "Endereco nao informado";
}

function orderCard(order, highlighted) {
  return `
    <article class="profile-order${highlighted ? " highlighted" : ""}">
      <div class="profile-order-head">
        <div>
          <small>Pedido</small>
          <h3>${escapeHtml(order.orderId)}</h3>
        </div>
        <span class="order-status status-${escapeHtml(String(order.status || "").toLowerCase())}">${escapeHtml(statusText(order.status))}</span>
      </div>
      <div class="profile-order-grid">
        <div><span>Total</span><strong>${money.format(Number(order.total || 0))}</strong></div>
        <div><span>Pagamento</span><strong>${escapeHtml(paymentText(order.paymentVariant))}</strong></div>
        <div><span>Compra</span><strong>${escapeHtml(formatDateTime(order.createdAt))}</strong></div>
        <div><span>Entrega prevista</span><strong>${escapeHtml(deliveryDate(order.createdAt))}</strong></div>
      </div>
      <div class="profile-address">
        <span>Entrega</span>
        <strong>${escapeHtml(addressText(order.address))}</strong>
        <small>Telefone: ${escapeHtml(order.address?.phone || order.customer?.phone || "Nao informado")}</small>
      </div>
      <div class="profile-items">
        ${(order.items || []).map(item => `
          <div>
            <span>${escapeHtml(item.name)}</span>
            <strong>${Number(item.quantity || 1)}x ${money.format(Number(item.price || 0))}</strong>
          </div>`).join("")}
      </div>
    </article>`;
}

async function renderProfile() {
  app.innerHTML = `${header()}
    <main class="profile-page">
      <div class="container">
        <a class="breadcrumb" href="pc-gamer.html">Voltar para a loja</a>
        <section class="profile-shell" id="profile-content">
          <div class="profile-loading">Carregando sua conta...</div>
        </section>
      </div>
    </main>${footer()}`;
  setupGlobalUi();
  try {
    const data = await api("/api/account");
    currentUser = data.user;
    updateAccountUi();
    const params = new URLSearchParams(window.location.search);
    const highlightedOrder = params.get("pedido");
    const confirmed = params.get("confirmado") === "1";
    const orders = Array.isArray(data.orders) ? data.orders : [];
    document.querySelector("#profile-content").innerHTML = `
      ${confirmed ? `<div class="profile-confirmation"><strong>Pedido aprovado!</strong><span>Pagamento confirmado com sucesso.</span></div>` : ""}
      <section class="profile-card">
        <div>
          <span>Minha conta</span>
          <h1>${escapeHtml(data.user.name)}</h1>
        </div>
        <div class="profile-info">
          <p><span>E-mail</span><strong>${escapeHtml(data.user.email)}</strong></p>
          <p><span>Total de pedidos</span><strong>${orders.length}</strong></p>
        </div>
      </section>
      <section class="profile-orders">
        <div class="profile-section-head">
          <h2>Meus pedidos</h2>
          <span>${orders.length ? `${orders.length} pedido${orders.length > 1 ? "s" : ""}` : "Nenhum pedido"}</span>
        </div>
        ${orders.length ? orders.map(order => orderCard(order, order.orderId === highlightedOrder)).join("") : `
          <div class="profile-empty">
            <h3>Nenhum pedido encontrado</h3>
            <p>Quando voce finalizar uma compra, ela aparece aqui.</p>
            <a class="btn" href="pc-gamer.html">VER PRODUTOS</a>
          </div>`}
      </section>`;
  } catch {
    document.querySelector("#profile-content").innerHTML = `
      <div class="profile-empty">
        <h3>Acesse sua conta</h3>
        <p>Entre para ver seus dados e pedidos.</p>
        <button class="btn" type="button" id="profile-login">ENTRAR</button>
      </div>`;
    document.querySelector("#profile-login")?.addEventListener("click", () => showAuth("login", () => renderProfile()));
  }
}

function renderCart() {
  const cart = detailedCart();
  app.innerHTML = `${header()}
    <main class="cart-page">
      <div class="container">
        <a class="breadcrumb" href="pc-gamer.html">← Continuar comprando</a>
        <h1 class="cart-title">Seu carrinho</h1>
        <div id="cart-content"></div>
      </div>
    </main>${footer()}`;

  const content = document.querySelector("#cart-content");
  setupGlobalUi();
  if (!cart.length) {
    content.innerHTML = `<div class="cart-list empty-cart"><div class="empty-icon">🛒</div><h2>Seu carrinho está vazio</h2><p>Que tal escolher uma máquina para chamar de sua?</p><a class="btn" href="pc-gamer.html">VER PRODUTOS</a></div>`;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discount = subtotal * .15;
  content.innerHTML = `
    <div class="cart-layout">
      <section class="cart-list" aria-label="Produtos no carrinho">
        ${cart.map(item => `
          <article class="cart-item">
            <img src="${item.product.image}" alt="">
            <div>
              <h2 class="item-name">${item.product.name}</h2>
              <span class="item-price">${money.format(item.product.price)}</span>
              <div class="qty" aria-label="Quantidade">
                <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
                <strong>${item.qty}</strong>
                <button type="button" data-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
              </div>
            </div>
            <button class="remove" type="button" data-action="remove" data-id="${item.id}">Remover</button>
          </article>`).join("")}
      </section>
      <aside class="summary">
        <h2>Resumo</h2>
        <div class="summary-line"><span>Subtotal</span><strong>${money.format(subtotal)}</strong></div>
        <div class="summary-line"><span>Frete</span><strong>Calculado depois</strong></div>
        <div class="summary-line"><span>Desconto no PIX</span><strong>− ${money.format(discount)}</strong></div>
        <form class="coupon" id="coupon-form"><input id="coupon" placeholder="Cupom de desconto" aria-label="Cupom de desconto"><button>Aplicar</button></form>
        <p class="coupon-message" id="coupon-message"></p>
        <div class="summary-line total"><span>Total no PIX</span><span>${money.format(subtotal - discount)}</span></div>
        <p class="pix-copy">Economia de ${money.format(discount)} pagando no PIX</p>
        <button class="btn" id="checkout" type="button">CONTINUAR PARA PAGAMENTO</button>
      </aside>
    </div>`;

  document.querySelector(".cart-list").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const cartData = getCart();
    const item = cartData.find(entry => entry.id === button.dataset.id);
    if (!item) return;
    if (button.dataset.action === "increase") item.qty += 1;
    if (button.dataset.action === "decrease") item.qty -= 1;
    const next = button.dataset.action === "remove" ? cartData.filter(entry => entry.id !== item.id) : cartData.filter(entry => entry.qty > 0);
    saveCart(next);
    renderCart();
  });

  document.querySelector("#coupon-form").addEventListener("submit", event => {
    event.preventDefault();
    const code = document.querySelector("#coupon").value.trim().toUpperCase();
    document.querySelector("#coupon-message").textContent = code ? "Cupom reservado para integração com o backend." : "Digite um cupom para validar.";
  });

  document.querySelector("#checkout").addEventListener("click", () => {
    openCheckout();
  });
}

async function bootstrapStore() {
  try {
    const data = await api("/api/products");
    if (Array.isArray(data.products) && data.products.length) products = promotionsFirst(data.products);
  } catch {
    // Mantém o catálogo incorporado para a vitrine ainda abrir sem o servidor.
  }
  if (document.body.dataset.page === "cart") renderCart();
  else if (document.body.dataset.page === "profile") renderProfile();
  else if (document.body.dataset.page === "home") renderHome();
  else renderCatalog();
}

bootstrapStore();
