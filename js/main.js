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

  // Normaliza nome de cidade: tira acentos, baixa caixa, remove espaços extras
  function normalizeCity(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  // Cidades dentro do raio simbólico (Jardim Graciosa, Campina Grande do Sul / PR)
  const SYMBOLIC_CITIES = ['campina grande do sul', 'quatro barras'];

  // Tabela regional (fallback, configurável)
  // Ajuste conforme sua tabela Melhor Envio / política final.
  const SHIPPING_RULES = [
    // Frete simbólico — entrega local (CGS + Quatro Barras / PR)
    {
      match: (uf, city) => uf === 'PR' && SYMBOLIC_CITIES.includes(normalizeCity(city)),
      price: 10.00,
      priceOriginal: 19.90,
      days: '1 dia útil',
      label: 'frete simbólico — entrega local',
      symbolic: true,
    },
    // Curitiba e demais cidades do PR
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

  // Resultado especial com risco no preço antigo + tag "frete simbólico"
  function setResultSymbolic(city, oldPrice, newPrice, days) {
    if (!result) return;
    result.textContent = '';
    result.dataset.state = 'ok';

    const pkg = document.createTextNode(`📦 ${city} · `);
    const oldEl = document.createElement('s');
    oldEl.className = 'shipping__old';
    oldEl.textContent = `R$ ${priceBR(oldPrice)}`;
    const newEl = document.createElement('strong');
    newEl.className = 'shipping__new';
    newEl.textContent = ` R$ ${priceBR(newPrice)}`;
    const sep = document.createTextNode(` · ${days} · `);
    const tag = document.createElement('span');
    tag.className = 'shipping__symbolic';
    tag.textContent = 'frete simbólico 🚚';

    result.append(pkg, oldEl, newEl, sep, tag);
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
        const rawCity = data.localidade || '';
        const rule = SHIPPING_RULES.find((r) => r.match(uf, rawCity)) || SHIPPING_RULES[SHIPPING_RULES.length - 1];
        const city = rawCity ? `${rawCity}/${uf}` : uf;

        if (rule.symbolic) {
          setResultSymbolic(city, rule.priceOriginal, rule.price, rule.days);
        } else {
          setResult(
            `📦 ${city} · Frete R$ ${priceBR(rule.price)} · ${rule.days}`,
            'ok'
          );
        }
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

  /* ---------- HERO CAROUSEL (scroll-snap + arrows + dots) ---------- */
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('[data-carousel-track]');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.carousel__slide'));
    if (slides.length === 0) return;

    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');
    const dotsRoot = root.querySelector('[data-carousel-dots]');

    let active = 0;

    // Build dots
    const dots = [];
    if (dotsRoot) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `Ir para o slide ${i + 1}`);
        b.className = 'carousel__dot';
        if (i === 0) b.setAttribute('aria-selected', 'true');
        b.addEventListener('click', () => goTo(i));
        dotsRoot.appendChild(b);
        dots.push(b);
      });
    }

    function goTo(i) {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      slides[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    function updateActive(i) {
      if (i === active) return;
      active = i;
      dots.forEach((d, idx) => d.setAttribute('aria-selected', idx === i ? 'true' : 'false'));
      slides.forEach((slide, idx) => {
        const v = slide.querySelector('video');
        if (!v) return;
        if (idx === i) {
          v.currentTime = 0;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }

    prev?.addEventListener('click', () => goTo(active - 1));
    next?.addEventListener('click', () => goTo(active + 1));

    // Detecta o slide ativo conforme a pessoa scrolla
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
              const idx = slides.indexOf(entry.target);
              if (idx >= 0) updateActive(idx);
            }
          });
        },
        { root: track, threshold: [0.6, 0.9] }
      );
      slides.forEach((s) => io.observe(s));
    }
  });

  /* ---------- VARIATIONS (color picker) ---------- */
  const variationButtons = document.querySelectorAll('[data-variation]');
  const variationTargetImg = document.querySelector('[data-variation-target]');
  const productNameEl = document.querySelector('[data-product-name]');
  const ctaYampiEls = document.querySelectorAll('[data-cta-yampi]');
  const carouselTrack = document.querySelector('[data-carousel-track]');

  function selectVariation(btn) {
    if (!btn) return;
    const url  = btn.dataset.url || '#';
    const img  = btn.dataset.img;
    const name = btn.dataset.name || '';

    // Estado dos botões
    variationButtons.forEach((b) => {
      b.setAttribute('aria-checked', b === btn ? 'true' : 'false');
    });

    // Foto principal do carrossel (slide 2)
    if (variationTargetImg && img) {
      variationTargetImg.src = img;
      variationTargetImg.alt = `Jogo de Panelas ${name}`;
    }

    // Nome do modelo abaixo da H1
    if (productNameEl) {
      productNameEl.innerHTML = '';
      const txt = document.createTextNode('Modelo: ');
      const strong = document.createElement('strong');
      strong.textContent = name;
      const tail = document.createTextNode(' · 10 peças');
      productNameEl.append(txt, strong, tail);
    }

    // URL de checkout em todos os CTAs
    ctaYampiEls.forEach((el) => {
      if (el.tagName === 'A') el.href = url;
    });

    // Scrolla o carrossel até o slide da variação (slide 2, índice 1)
    if (carouselTrack) {
      const targetSlide = carouselTrack.querySelectorAll('.carousel__slide')[1];
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }

  variationButtons.forEach((btn) => {
    btn.addEventListener('click', () => selectVariation(btn));
  });

  // Estado inicial: usa o aria-checked já marcado no HTML
  const initialVariation = document.querySelector('[data-variation][aria-checked="true"]')
    || variationButtons[0];
  if (initialVariation) selectVariation(initialVariation);

  /* ---------- KIT VIDEO (autoplay mudo + botão toggle de áudio) ---------- */
  const kitVideo = document.querySelector('.kit-video__el');
  const kitToggle = document.querySelector('[data-kit-video-toggle]');

  if (kitVideo) {
    kitVideo.muted = true;
    kitVideo.play().catch(() => {});
  }

  if (kitVideo && kitToggle) {
    const icon = kitToggle.querySelector('.kit-video__icon');
    const label = kitToggle.querySelector('.kit-video__label');

    kitToggle.addEventListener('click', () => {
      kitVideo.muted = !kitVideo.muted;
      const isMuted = kitVideo.muted;

      // O botão mostra a AÇÃO disponível, não o estado atual:
      // - se está mudo  → "🔊 Toque para ouvir"
      // - se tem som    → "🔇 Silenciar"
      if (icon)  icon.textContent  = isMuted ? '🔊' : '🔇';
      if (label) label.textContent = isMuted ? 'Toque para ouvir' : 'Silenciar';
      kitToggle.setAttribute('aria-pressed', isMuted ? 'false' : 'true');
      kitToggle.setAttribute('aria-label',
        isMuted ? 'Ativar som do vídeo' : 'Silenciar vídeo');

      // Garante que continua tocando após o toggle.
      kitVideo.play().catch(() => {});
    });
  }

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
