# Cozinha Bonita — OPP Dia das Mães 2026

One product page estática para venda do Jogo de Panelas D'Italia/Imperial 10 peças, campanha Dia das Mães 10/05/2026.

**Stack:** HTML5 + CSS3 puro + JavaScript vanilla. Sem build. Sem dependências. Deploy em qualquer estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## Estrutura

```
panelas-dia-das-maes/
├── index.html            ← 10 blocos do briefing
├── css/style.css         ← mobile-first, paleta cappuccino
├── js/main.js            ← countdown, FAQ, CEP, tracking
├── assets/
│   ├── produto/          ← fotos WebP + og-image.jpg
│   └── icones/           ← favicon + selos de pagamento
└── README.md
```

---

## 1. Placeholders a substituir antes de publicar

Use **Find & Replace** no VS Code (Ctrl+Shift+H) nos arquivos `index.html`:

| Placeholder | Onde | Como obter |
|---|---|---|
| `[URL_YAMPI]` | 3 botões de compra | Painel Yampi → Produtos → Link do produto/checkout |
| `[META_PIXEL_ID]` | Bloco `<!-- META PIXEL AQUI -->` no `<head>` | business.facebook.com → Gerenciador de Eventos → criar Pixel. Depois **descomente** o bloco. |
| `[GA_MEASUREMENT_ID]` | Bloco GA4 no `<head>` | analytics.google.com → criar propriedade GA4 (formato `G-XXXXXXX`). Descomente o bloco. |
| `[CNPJ]` | Footer | Após abertura do MEI (gov.br) |
| `[NOME FANTASIA]` | Footer | Nome da sua loja (ex.: "Cozinha Bonita Presentes") |
| `5541000000000` | Links WhatsApp (header, float, footer) | Formato **`55` + DDD + número** sem espaços/parênteses |
| `(41) 9 0000-0000` | Texto visível do telefone | Seu número real |
| `contato@cozinhabonita.com.br` | Footer | Seu e-mail de contato |

### Atalhos práticos

```bash
# Substituir número do WhatsApp (troque 41987654321 pelo seu):
# VS Code: Find = 5541000000000, Replace = 5541987654321

# Substituir URL Yampi:
# VS Code: Find = [URL_YAMPI], Replace = https://seguro.sualoja.com.br/...
```

---

## 2. Fotos do produto

Coloque 6 arquivos em `assets/produto/` com estes nomes exatos:

| Arquivo | Proporção | Tamanho alvo |
|---|---|---|
| `hero.webp` | 1:1 ou 4:5 | <200 KB |
| `galeria-1.webp` | 16:9 | <200 KB |
| `galeria-2.webp` a `galeria-5.webp` | 1:1 | <150 KB cada |
| `og-image.jpg` | 1200×630 | <300 KB, **sempre JPG/PNG** (WhatsApp nem sempre renderiza WebP em preview) |

**Otimizar fotos (recomendado):**
- [squoosh.app](https://squoosh.app) — interface no navegador, arraste o JPG → exporte WebP q=80
- Ou via CLI: `cwebp -q 80 foto-original.jpg -o hero.webp`

**Enquanto as fotos reais não chegam**, a página já tem placeholders coloridos WebP/JPG (retângulos cappuccino) para não quebrar o layout.

---

## 3. Deploy na Vercel (passo a passo)

### Opção A — via dashboard (mais simples)

1. Crie conta em [vercel.com](https://vercel.com) (entre com GitHub ou e-mail)
2. Clique em **Add New → Project**
3. Se tiver no GitHub: conecte o repositório
   **OU** arraste a pasta `panelas-dia-das-maes/` inteira para o upload direto
4. **Framework Preset:** `Other` (é estático puro)
5. **Build command:** deixe **vazio**
6. **Output directory:** deixe **vazio** (serve a raiz)
7. Clique em **Deploy**
8. Em ~30s você recebe uma URL `https://panelas-xxxxx.vercel.app`

### Opção B — via CLI

```bash
npm i -g vercel
cd panelas-dia-das-maes
vercel          # primeira vez, segue o wizard; escolha "No" para build step
vercel --prod   # publica em produção
```

---

## 4. Conectar domínio próprio

Sugestões do briefing:
- `cozinhabonita.com.br`
- `minhamaemerece.com.br`
- `ofertapanelas.com.br`

**Registro:** [registro.br](https://registro.br) — ~R$40/ano, paga só na confirmação

**Apontar para Vercel:**

1. Na Vercel: **Project → Settings → Domains → Add**
2. Digite `cozinhabonita.com.br` e `www.cozinhabonita.com.br`
3. A Vercel mostra 2 registros para configurar. No **registro.br → DNS → Editar zona**, adicione:

```
Tipo     Nome   Valor
A        @      76.76.21.21
CNAME    www    cname.vercel-dns.com
```

4. Aguarde 5–60 minutos (propagação DNS)
5. SSL/HTTPS é ativado automaticamente pela Vercel

---

## 5. Integração com Yampi

1. Cadastre-se em [yampi.com.br](https://yampi.com.br) com seu CNPJ MEI
2. Conecte **Mercado Pago** (Configurações → Pagamentos)
3. Conecte **Melhor Envio** com origem no seu CEP (Configurações → Frete)
4. Cadastre o produto "Jogo de Panelas 10 peças" (SKU, peso ~5kg, dimensões da caixa)
5. Copie o **link do produto/checkout** e substitua `[URL_YAMPI]` no `index.html`

**Dica:** use o botão direto de checkout (tipo "Comprar agora") em vez de "Adicionar ao carrinho" — menos um passo na jornada.

---

## 6. Meta Pixel + eventos de conversão

1. Crie o Pixel em [business.facebook.com](https://business.facebook.com) → Gerenciador de Eventos
2. Copie o ID (15 dígitos) e substitua `[META_PIXEL_ID]` no `<head>` do `index.html`
3. **Descomente** o bloco `<!-- META PIXEL AQUI -->`
4. No Yampi: Configurações → Integrações → Facebook Pixel → cole o mesmo ID (para disparar `Purchase` no checkout)

Eventos já mapeados no JS (`data-track`):
- `cta_hero` → botão principal do topo
- `cta_oferta` → botão dentro do bloco de oferta
- `cta_sticky` → barra fixa em mobile

---

## 7. UTMs para anúncios do Marketplace

Use este formato ao copiar o link da loja nos anúncios do Facebook Marketplace:

```
https://seudominio.com.br/?utm_source=marketplace&utm_medium=organic&utm_campaign=diadasmaes&utm_content=anuncio01
```

Troque `anuncio01` para cada variação — assim você mede qual anúncio converte mais.

---

## 8. Checklist de validação antes de publicar

### Conteúdo
- [ ] `[URL_YAMPI]` substituído em todos os botões de compra
- [ ] Número do WhatsApp real (header, float, footer)
- [ ] E-mail de contato real no footer
- [ ] CNPJ e nome fantasia do MEI no footer
- [ ] Meta Pixel descomentado com ID real
- [ ] GA4 descomentado com ID real

### Fotos
- [ ] `hero.webp` — foto boa e iluminada do jogo completo
- [ ] `galeria-1.webp` até `galeria-5.webp` preenchidas
- [ ] `og-image.jpg` 1200×630 para preview no WhatsApp
- [ ] Todas as fotos <200 KB (teste rodando `ls -la assets/produto/`)

### Técnico
- [ ] Abrir em mobile real (320–414 px de largura) e rolar a página toda
- [ ] Abrir em desktop (1440 px) e conferir alinhamento
- [ ] Clicar em cada CTA e verificar se abre Yampi (ou resposta esperada)
- [ ] Clicar no botão flutuante do WhatsApp → deve abrir conversa com mensagem pré-pronta
- [ ] Expandir todos os FAQs (accordion deve fechar os outros)
- [ ] Testar CEP válido (ex.: 80000-000 Curitiba) e inválido (ex.: 00000-000)
- [ ] Countdown contando segundo a segundo com 00:00:00:00 em 09/05/2026
- [ ] Compartilhar URL no WhatsApp → preview aparece com og-image
- [ ] Rodar [PageSpeed Insights](https://pagespeed.web.dev) — meta: performance ≥85 em mobile
- [ ] Rodar [mobile-friendly test](https://search.google.com/test/mobile-friendly)

### Compra teste
- [ ] Fazer 1 compra com seu próprio cartão
- [ ] Pedido aparece no painel Yampi
- [ ] Etiqueta do Melhor Envio é gerada
- [ ] Reembolsar o pedido teste

---

## 9. Rodar localmente

Como é 100% estático, qualquer servidor simples serve:

```bash
# Opção 1: npx (precisa Node.js)
npx serve .

# Opção 2: Python (se tiver instalado)
python -m http.server 8000

# Opção 3: VS Code — extensão "Live Server"
```

Depois abra `http://localhost:8000` (ou a porta exibida).

---

## 10. Suporte e dúvidas

Qualquer ajuste de copy, nova seção, variação A/B, integração com pixel alternativo — é só escrever de volta para o Claude Code apontando este projeto.

Boa campanha, Luis! 🧡
