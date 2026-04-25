/* ============================================================
   Cozinha Bonita — JS principal
   - Countdown até 08/05/2026 23:59 (horário de Brasília UTC-3)
   - FAQ accordion (exclusivo: abre 1 por vez)
   - Máscara de CEP + calculadora de frete via ViaCEP + tabela regional
   - Tracking de cliques em CTA (placeholder para Meta Pixel / GA4)
============================================================ */

(function () {
  'use strict';

  /* ---------- COUNTDOWN ---------- */
  // Deadline: 08/05/2026 23:59:59 (horário de Brasília, UTC-03:00)
  const DEADLINE = new Date('2026-05-08T23:59:59-03:00').getTime();

  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-min'),
    s: document.getElementById('cd-sec'),
  };

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const diff = DEADLINE - Date.now();

    if (diff <= 0) {
      if (els.d) els.d.textContent = '00';
      if (els.h) els.h.textContent = '00';
      if (els.m) els.m.textContent = '00';
      if (els.s) els.s.textContent = '00';
      return false;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (els.d) els.d.textContent = pad(days);
    if (els.h) els.h.textContent = pad(hours);
    if (els.m) els.m.textContent = pad(minutes);
    if (els.s) els.s.textContent = pad(seconds);
    return true;
  }

  if (els.d) {
    tick();
    const timer = setInterval(() => {
      if (!tick()) clearInterval(timer);
    }, 1000);
  }

  /* ---------- FAQ EXCLUSIVE ACCORDION ---------- */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- CEP MASK + SHIPPING CALC ---------- */
  const form = document.getElementById('shipping-form');
  const cepInput = document.getElementById('cep');
  const result = document.getElementById('shipping-result');

  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 8);
      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
      e.target.value = v;
    });
  }

  // Tabela regional (fallback, configurável)
  // Ajuste conforme sua tabela Melhor Envio / política final.
  const SHIPPING_RULES = [
    // Curitiba e região metropolitana (por UF=PR e DDD de cidade)
    { match: (uf) => uf === 'PR', price: 19.9, days: '1-2 dias úteis', label: 'região metropolitana de Curitiba' },
    // Sudeste
    { match: (uf) => ['SP','RJ','MG','ES'].includes(uf), price: 29.9, days: '3-5 dias úteis', label: 'Sudeste' },
    // Sul (SC, RS)
    { match: (uf) => ['SC','RS'].includes(uf), price: 24.9, days: '2-4 dias úteis', label: 'Sul' },
    // Centro-Oeste
    { match: (uf) => ['DF','GO','MS','MT'].includes(uf), price: 39.9, days: '4-7 dias úteis', label: 'Centro-Oeste' },
    // Nordeste
    { match: (uf) => ['BA','SE','AL','PE','PB','RN','CE','PI','MA'].includes(uf), price: 49.9, days: '5-9 dias úteis', label: 'Nordeste' },
    // Norte
    { match: (uf) => ['PA','AM','AC','RO','RR','AP','TO'].includes(uf), price: 69.9, days: '7-12 dias úteis', label: 'Norte' },
  ];

  function priceBR(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setResult(text, state) {
    if (!result) return;
    result.textContent = text;
    result.dataset.state = state || '';
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cep = (cepInput.value || '').replace(/\D/g, '');

      if (cep.length !== 8) {
        setResult('Digite um CEP válido com 8 dígitos.', 'error');
        return;
      }

      setResult('Consultando CEP...', 'loading');

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();

        if (data.erro) {
          setResult('CEP não encontrado. Verifique e tente novamente.', 'error');
          return;
        }

        const uf = data.uf;
        const rule = SHIPPING_RULES.find((r) => r.match(uf)) || SHIPPING_RULES[SHIPPING_RULES.length - 1];
        const city = data.localidade ? `${data.localidade}/${uf}` : uf;

        setResult(
          `📦 ${city} · Frete R$ ${priceBR(rule.price)} · ${rule.days}`,
          'ok'
        );
      } catch (err) {
        setResult('Erro ao consultar o CEP. Tente novamente em instantes.', 'error');
      }
    });
  }

  /* ---------- CTA TRACKING (placeholder para Meta Pixel / GA4) ---------- */
  document.querySelectorAll('[data-track]').forEach((el) => {
    el.addEventListener('click', () => {
      const label = el.dataset.track;
      // Meta Pixel:
      if (window.fbq) window.fbq('track', 'InitiateCheckout', { content_name: label });
      // GA4:
      if (window.gtag) window.gtag('event', 'begin_checkout', { event_label: label });
      // Console helper em dev:
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('[track]', label);
      }
    });
  });

  /* ---------- Lazy reveal (leve, sem lib) ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('.benefit, .testimonial, .gallery__item').forEach((el) => io.observe(el));
  }
})();
