# MALIKA · مليكة — bilingual perfume storefront

A front-end-only luxury perfume store built with **React + Vite + TypeScript + Tailwind CSS v4**.
Arabic / English, RTL-first, WhatsApp & Messenger ordering, a local product studio, and GitHub publishing.

---

## التشغيل

```bash
npm install
npm run dev      # local development
npm run build    # production build → dist/index.html
npm run preview  # preview production build
```

The production build is a **single HTML file** (vite-plugin-singlefile). Product photography is loaded from
external URLs, so the bundle stays small.

## الصفحات — Pages

| Route | Folder | Sections |
| --- | --- | --- |
| `#/` | `src/pages/Home/` | Hero, NotesMarquee, Featured, ScentFinder, StorySection, Pillars, Testimonials, ContactCTA |
| `#/shop` | `src/pages/Shop/` | ShopHeroSlider, ShopIntro, FilterBar, ProductGrid (6 at a time) |
| `#/product/:slug` | `src/pages/Product/` | Gallery, PurchasePanel, ProductNotes, ProductDetails, RelatedScents |
| `#/about` | `src/pages/About/` | AboutHero, HouseStory, Values, Process |
| `#/contact` | `src/pages/Contact/` | ContactHero, Channels, ContactForm, ContactFaq |
| `#/studio` | `src/pages/Admin/` | AdminHeader, ProductTable, ProductForm, StoreSettingsForm, GithubPanel, SetupGuide |

Each page lives in its own folder and is composed from small section files. The app uses a small custom
hash router (`src/lib/router.tsx`), so deep links work on static hosting without server rewrites.

## المنتجات — One file per perfume

Every scent has its own file in `src/data/products/`:

```
src/data/products/
  malika-noir.ts        fig-and-ember.ts     velvet-dusk.ts
  cedar-static.ts      iris-mirage.ts       salt-and-smoke.ts
  oud-meridian.ts      citrus-archive.ts    bloom-ledger.ts
  amber-hours.ts       musk-elsewhere.ts    night-jasmine.ts
  index.ts             ← imports + helpers (featured, related, ranges)
  catalog.json         ← written by the studio / GitHub publish
```

To add a scent in code: copy a file, change the object, import it in `index.ts`.
Or add it from the **Studio** at `#/studio` — no code required.

## التجربة ثلاثية الأبعاد — Scroll-driven 3D perfume experience

A cinematic, scroll-linked section on the home page that disassembles the
flacon into its nine components and reassembles it. Built with
**@react-three/fiber + drei + GSAP ScrollTrigger**.

### Stages (master progress 0 → 1)

| Range | Stage | What happens |
| --- | --- | --- |
| 0–15% | Hero reveal | Assembled bottle, slow float + rotation, name and tagline fade in |
| 15–40% | Separation | Nine parts travel along individual trajectories, staggered |
| 40–60% | Exploded showcase | Camera orbits, connector lines + four technical callouts, craft story |
| 60–85% | Reassembly | The same curve played in reverse — parts land exactly on their rest transforms |
| 85–100% | Final reveal | Push-in, specular highlight sweep, notes, price and CTAs |

Scrolling up reverses everything; `explosionFactor()` is a single symmetrical
curve, so forward and backward are exact mirrors with no jumps.

### Architecture

```
src/
 ├ components/perfume/
 │   PerfumeExperience.tsx    orchestrator: capability, lazy mount, sticky layout
 │   PerfumeScene.tsx         Canvas, lighting rig, environment, camera, shadows
 │   PerfumeBottleModel.tsx   the nine parts + materials (procedural or GLB)
 │   PerfumeExplodedParts.tsx connector lines + technical labels
 │   PerfumeProductInfo.tsx   stage-synced editorial copy
 │   PerfumeScrollProgress.tsx minimal progress rail
 │   PerfumeFallback.tsx      static product block (no WebGL / reduced motion)
 ├ hooks/usePerfumeScrollAnimation.ts   one master ScrollTrigger
 ├ config/perfumeModelConfig.ts         parts, camera keys, quality, copy
 ├ utils/perfumeTransforms.ts           pure maths (no React/Three imports)
 └ styles/perfume-experience.css
public/models/README.md                 ← GLB integration guide
```

### Performance & accessibility

- Canvas mounts only within 600px of the viewport, and `frameloop` is set to
  `never` while the section is off-screen.
- Scroll progress is written to a **ref**; the 3D rig and every DOM overlay read
  it inside `useFrame`/`rAF`. Scrolling triggers **zero React re-renders**.
- No allocations inside frame loops (pre-allocated vectors and scratch arrays).
- Quality auto-profiles (`high` / `medium` / `low`) tune DPR, glass transmission,
  contact shadows, connectors and geometry segments from device capability.
- `prefers-reduced-motion` or missing WebGL → static `PerfumeFallback`.
- Geometries, the label canvas texture and the connector buffer are disposed on
  unmount; GSAP runs inside `gsap.context()` and is reverted on cleanup.

> **Pinning note:** the sticky viewport uses CSS `position: sticky`, not a GSAP
> pin. Page wrappers animate **opacity only** for the same reason — any
> transform on an ancestor creates a containing block that breaks fixed/pinned
> positioning.

### ⚠️ About the 3D asset

No commercial GLB was available, so the bottle is **procedurally modelled in
`PerfumeBottleModel.tsx`** from lathe and cylinder geometry: a shouldered oval
flacon with nine genuinely separate meshes and chamfered edges on every profile.

Realism comes from the render setup rather than from a scanned asset:

- **`MeshTransmissionMaterial`** — real-time refraction with chromatic
  aberration, IOR 1.52 and attenuation, instead of fake alpha transparency.
- **Vertical strip softboxes** in the environment; their long reflections down
  the shoulders are the signature of a real product light-tent.
- **Reflective floor** (`MeshReflectorMaterial`) plus contact shadows.
- Gold-foil label on dark stock, flat-laid machined rings on the collar, cap
  and pump, a weighted lacquer base and a smoked dip tube.
- Only the body uses a transmission buffer; the neck is thin glass and the base
  is lacquer, which keeps it to **one** render target.

This is real geometry separation, not a 2D trick — but it is **not a
photoscanned production asset**. For final photorealism, supply a proper
exploded-view GLB; `public/models/README.md` documents the exact file location,
the required mesh names and the pivot conventions. Nothing in the animation
layer changes.

## كارت المنتج — The product card

`src/components/product/ProductCard.tsx` is the CodePen "Nike card" concept
rebuilt in React + Tailwind and re-skinned in the house palette.

**How the interaction maps**

| Original | Here |
| --- | --- |
| Lime `clip-path` disc | A disc in **each product's own `accent` colour**, expanding from `circle(140px at 80% 18%)` to `circle(330px at 80% -18%)` |
| `:after` "Nike" watermark | The scent's own name, oversized in the display serif at 7% opacity |
| Shoe PNG, rotates on hover | Transparent-background bottle, tilts and scales as the panel opens |
| Sizes 7/8/9/10 | **Real ml sizes** — tapping one re-prices the card live |
| Colour dots | **Note swatches** for top / heart / base, derived from the product accent, each with the note name on hover |
| "Buy Now" link | **Add to bag**, wired to the real cart with a check-mark confirmation |

Also added: new / bestseller / discount badges, a wishlist toggle, the
compare-at price, and a stable per-product tilt derived from the slug so two
scents that share a bottle photograph still read as different cards.

**Touch devices.** The original is hover-only, which is unreachable on a
phone. A Tailwind v4 custom variant handles it:

```css
@custom-variant touch (@media (hover: none));
```

Every hover state is paired with a `touch:` variant, so on phones and tablets
the card renders permanently open — disc expanded, sizes, notes and the buy
button all visible. The layout mirrors fully in RTL, including the disc, which
is flipped explicitly because `clip-path` is not direction-aware.

## صور المنتجات — Transparent product images

The cards need cut-out bottles, not photographs with a background. Asking the
image model for "a transparent background" does not work — it *draws* a
checkerboard pattern instead of writing an alpha channel. So the bottles were
generated on a flat chroma-key background and keyed out with ImageMagick:

1. flood-fill from all four corners, so a coloured reflection *inside* the
   glass is never punched out;
2. erode + blur the alpha edge to kill jaggies;
3. despill — clamp the key channel toward the other two so no green rim
   survives on the glass;
4. trim, pad, and export WebP with alpha (**347 KB PNG → 15 KB WebP**).

Seven bottles are inlined (see *Bottle cut-outs*) and are mapped
per product through the `cutout` field, which is editable in the studio and
falls back to `images[0]` when empty.

> To use your own: paste an `https` link to a PNG/WebP with a real alpha channel
> into the product's **Card image — transparent background** field in the studio.

## كل شيء قابل للتعديل — What the studio controls

| Where in Studio → Site content | What it changes |
| --- | --- |
| Home page sections | show/hide each home section |
| Sizes & spacing | heading size, lead-text size, space between sections (live) |
| Shop page slider · Shop filters | slider on/off, scope, max slides, **card size**; each filter on/off |
| **Moving strips (all three)** | announcement bar, hero strip, notes strip — items, **speed, direction** each |
| Image card · Hero · Featured · Finder · CTA · Story · Promises · Testimonials · FAQ | their copy and lists |
| 3D bottle experience | the story shown while the bottle comes apart |
| Brand name | logo, footer word, copyright, hero/strip watermark, shop-card word |
| **Every other text on the site** | **296 texts**: menus, buttons, footer, shop, product page, About, Contact, cart — both languages |
| Theme colours | ink / bone / accent / lilac |
| Products · Storefront (contact details) · GitHub publish | their own tabs |

**Strips.** `direction` is the *literal on-screen direction* in both languages
(earlier versions mirrored it in Arabic, so "left" moved right). Defaults are
announcement ←, hero →, notes ←, so neighbours run against each other; the
editor shows the three arrows, warns when two neighbours move the same way and
has a **Make them alternate** button.

**How every text becomes editable.** `t("key")` and a new inline helper
`x("English", "العربية")` both look for the owner's edit first
(`LanguageContext`). Only the *differences* from the built-in wording are stored
(`content.textOverrides`), so un-edited text keeps following the code. Studio,
login and publish wording is **never** overridable — a typo there must not lock
you out. Edits are validated when read: unknown ids, non-string values and
studio-only keys are discarded.

The list the editor shows is **generated**, not hand-kept:

```bash
node scripts/list-texts.mjs     # rewrites src/i18n/textCatalog.ts
```

It collects dictionary keys that a page really references (so the editor never
offers a field that changes nothing) and every `x("…", "…")` pair. **Re-run it
after adding or rewording any text.** If you change the *English* source of an
inline text in code, an edit made to the old wording no longer matches and is
dropped.

**Still fixed in code** (not editable from the studio): the studio's own screens;
WhatsApp/Messenger order-message wording (`lib/messaging.ts`); the four mood
hints in the scent finder; the stage names on the 3D progress rail and the part
callouts in the exploded view; the story-section statistics and the photographs;
the set of menu/footer *links* (their labels are editable); `index.html`'s
title and description; the governorate list at checkout.

## الأحجام والمسافات — Sizes & spacing (studio-controlled)

Studio → **Site content → Sizes & spacing** has three sliders, applied live:

| Slider | Range | Controls |
| --- | --- | --- |
| Heading size | 60–130 % | hero, page and section headings, the 3D section titles |
| Section spacing | 40–140 % | the vertical gap between sections and page headers |
| Lead text size | 80–125 % | the paragraph under each heading |

**How.** `ThemeProvider` writes three CSS variables (`--hs`, `--bs`, `--ss`);
the classes `.hd-hero / .hd-page / .hd-section / .hd-sub`, `.lead-copy` and
`.sec-y / .sec-pb / .hero-pad / .page-pad` (in `index.css`) multiply their
`clamp()` sizes by them. One change restyles every page with no React render.
The new 100 % base is smaller than before — the hero title went from 121 px to
83 px on desktop, and section padding from 96 px to 72 px.

- **Live preview:** while a slider moves the real site restyles; leaving the
  editor without saving restores the stored values.
- **Safe by construction:** values are clamped when read (`mergeContent`), so a
  hand-edited or imported `900` can never break the layout.
- Add a new heading? Give it `hd-section` (or `-page` / `-sub`) instead of a
  fixed `text-*` size and it joins the control automatically.

## صفحة المتجر — Shop page

The first section is now an interactive product slider
(`ShopHeroSlider.tsx`, `ShopSlide.tsx`, `LongevityRing.tsx`,
`styles/shop-slider.css`), rebuilt from the supplied Star Wars card in
React + Tailwind with **no Swiper and no jQuery**.

| Original | Here |
| --- | --- |
| Red gradient + death-star photo | ink stage; every colour comes from the **active scent's accent**, cross-fading between slides (`@property --acc`) |
| Product list | the store's real products (all or featured-only, up to *N*, set in the studio) |
| Helmet size / engine unit (radio groups) | real ml sizes as radio inputs — re-prices the slide — and the scent's notes |
| "Durability rate" ring | **longevity** ring: the product's `10–12h` text is read as hours, 12 h = full ring |
| Add to cart / wishlist | the real cart and wishlist; the heart's sprite sheet is replaced by CSS (pop + sparks) |
| Swiper fade + jQuery | stacked grid + opacity; swipe, arrows, dots, ← → keys (RTL-aware); inactive slides are `inert` |

Below it: a compact intro with trust chips, then a **one-line filter bar**:

```
[ search ]  [ Everything 12 ][ Fresh 3 ][ Floral 4 ][ Woody 3 ][ Oriental 2 ]   [ Sort ▾ ] [ More ]
```

Gender, price and "saved only" sit behind the single **More** button, which wears
a badge while any of them is active; a round ✕ appears only when something is
filtered. On a phone it is three short rows (search · families · sort + More).
The previous design had a second row of controls, a result counter and a chip per
active filter. **Every control can be switched off from the studio** (Shop
filters); a hidden filter is never applied, so a leftover `?category=woody` in
the address cannot keep filtering invisibly. The price slider is **off by
default** — with twelve scents it adds little; switch it on if you want it.

**Card size.** The slider defaults to *compact*: 468 px tall on desktop (was 628)
and 608 px on a phone (was 926). *Standard* restores the taller card. Every
dimension is a CSS variable on `.shop-stage` (`--st-h`, `--st-bottle-h`, …), so
adding a third size is one more block in `shop-slider.css`.

> `.field` (the shared input style) now lives in `@layer components`.
> Unlayered rules beat every Tailwind utility, so `ps-10` / `pe-12` on a field
> were silently ignored — the search icon sat on the placeholder text.

## كارت الصور — The image card (up to 5 images)

`src/pages/Home/Showcase.tsx`, edited in **Studio → Site content → Image card**.

| | |
| --- | --- |
| Limit | **5 images.** Enforced in the editor (the add button locks at 5/5), in `mergeContent()` (stored or imported data is cut to 5) and at render time |
| Add an image | **Upload** (any photo is downscaled to ≤900 px and re-encoded as WebP, keeping transparency — a 3.5 MB photo becomes ~70 KB), **paste a link**, or **use a scent's own image** |
| Per image | Linked scent (adds name, notes, price and a "Discover" button), fit (*transparent bottle* / *photo fill*), optional bilingual caption, move up/down, remove |
| Storefront | Swipe, arrows, thumbnails or ← → keys (direction-aware in RTL). Auto-advances every 5.5 s, driven by the progress bar's own `animationend` so they never drift apart |
| Pauses when | the card is off screen, a real mouse hovers it, a finger is on it, keyboard focus is inside, or the visitor prefers reduced motion |
| 0 images | the section hides itself; 1 image shows no arrows or thumbnails |

Uploads are stored as data URLs inside the site content, so a budget of ~1.4 MB
of uploaded images is enforced to stay inside the browser's ~5 MB storage. Past
that the editor asks for a link instead.

> **Publishing.** Site content (this card, all copy, the strip, the theme) is now
> included when you press *Publish to GitHub* and is read back from
> `catalog.json` on the next build. Earlier builds only published products and
> store settings, so content edits existed in the owner's own browser only.

## الأداء — Performance

- **3D scene is created at site entry** (right after first paint, via
  `requestIdleCallback`), runs a short warm-up so shaders compile while the
  visitor reads the hero, then pauses off-screen. There is no loading card.
- **Phones always use the lightweight profile** (no real-time refraction, which
  renders the scene twice per frame). Tablets get it only on capable hardware.
- `resize={{ scroll: false }}` on the canvas — by default react-use-measure
  re-reads layout on **every scroll event**.
- `ScrollTrigger.config({ ignoreMobileResize: true })` stops the collapsing
  address bar re-measuring the page mid-scroll.
- The scroll progress bar and the 3D copy overlays write to the DOM directly and
  skip all work when nothing changed — scrolling triggers no React renders.
- Below-the-fold sections use `content-visibility: auto`.
- On phones: blend-mode grain, 100px blurs and infinite decorative loops are off.

> **Provider order.** `StoreProvider` is now outermost and `LanguageProvider`
> sits inside it, because the language layer reads the owner's text edits from the
> store. The store itself needs nothing from the language.

## الشريط المتحرك — Marquee: why it vanished in Arabic

An overflowing track in an RTL document anchors to the **right** edge, so
translating it leftwards exposed empty space — in Arabic all three strips were
blank 100% of the time while English was fine. `Marquee.tsx` now lays out its
geometry strictly left-to-right and only the *text* follows the reading
direction. Strips also activate 150% of a screen before they appear, so they are
already moving when reached.

## صور الزجاجات — Bottle cut-outs

The seven built-in bottle images are **inlined into the JavaScript bundle** as
data URIs (`src/data/bottleAssets.ts`, ~150 KB), not served from `public/`.

- The site ships as one HTML file. A separate `/images/...` request can 404 in a
  single-file deployment, and binary files are easy to lose between machines. A
  generated TypeScript module is plain text and cannot go missing.
- Products still reference a path like `/images/bottles/dark.webp`;
  `resolveAsset()` (`src/lib/assets.ts`) swaps in the inlined data. Any other
  value — an `https` link, an uploaded data URL — passes straight through.
- If a card's cut-out ever fails to load, it falls back to the product photo.

To regenerate (source shots live in `assets-src/`, never shipped):

```bash
SIZE=400x560 QUALITY=82 bash scripts/cutout-bottle.sh assets-src/bottles/raw-dark.png /tmp/bottles/dark.webp green
bash scripts/embed-bottles.sh /tmp/bottles      # rewrites src/data/bottleAssets.ts
```

## لوحة التحكم الكاملة — Full site control

Everything on the storefront is editable from `#/studio` → **Site content**,
with no code and no rebuild. Twelve collapsible sections:

| Section | What you control |
| --- | --- |
| Home page sections | Show/hide the strip, featured, 3D bottle, scent finder, story, promises, testimonials, CTA |
| Announcement bar | The rotating messages at the very top (add / remove / edit) |
| Image card | Up to **5** product images: upload, link or pick a scent |
| Moving strip | Notes list, **speed in px/s**, direction, caption, on-off |
| Hero | Eyebrow, both title lines, lead, both buttons, and the stat blocks |
| Featured / Finder / CTA | Eyebrow, title and lead for each section |
| Story | Eyebrow, title, lead, pull-quote and attribution |
| Promises | Section heading plus every promise card |
| Testimonials | Heading plus each quote, name, city, rating, initials and accent colour |
| FAQ | Every question and answer |
| Theme colours | Ink, bone, accent and lilac — applied live across the whole site |

Every text field is **bilingual** (English + Arabic side by side). Lists can be
extended or trimmed freely. Edits are held in a draft until you press
**Save content**, then they flag the catalogue as unpublished so the GitHub
publish flow picks them up.

Theme colours are pushed into the Tailwind CSS custom properties by
`ThemeProvider`, and derived shades (bone-2, plum, accent-deep) are computed
automatically, so picking four colours restyles the entire storefront.

## الشريط المتحرك — The moving strip

`src/components/ui/Marquee.tsx` replaces the old CSS keyframe marquee.

- **Constant speed in pixels per second**, so it reads identically on a 390px
  phone and a 1440px desktop. A fixed CSS duration could not do this — it
  crawled on mobile and raced on desktop.
- Content is **measured and repeated** until it covers twice the container, so
  there is never a gap or a visible seam.
- **Pauses when off-screen** and when the tab is hidden, so phones do not burn
  battery animating something nobody can see.
- **Swipe to scrub** with flick momentum on touch; `touch-action: pan-y` keeps
  vertical page scrolling completely natural.
- Mirrors correctly in RTL and falls back to a static strip under
  `prefers-reduced-motion`.

Used by the announcement bar, the hero note strip and the notes section.

## الطلب عبر الشات — Chat checkout

1. Add scents (any size) to the bag.
2. In the bag press **إتمام طلبك / Complete your order**.
3. Fill name, WhatsApp number, governorate, address and an optional note.
4. Press **Send order on WhatsApp**: the generated message contains every line
   (name, size, quantity, line total), item count, subtotal, delivery rule,
   payment method and the customer's delivery details.
5. Messenger is supported too — the order is copied to the clipboard because
   Messenger cannot prefill text. A confirmation screen offers a retry link.
6. "Send bag right away" still exists for shoppers who prefer to chat first.

## قفل الاستوديو — Studio access control

The studio at `#/studio` is protected by a passcode gate.

| | |
| --- | --- |
| Username | `admin` |
| Password | the 11-digit number you chose (never written in this repo) |
| Algorithm | PBKDF2-HMAC-SHA256, **310,000 iterations**, 16-byte salt |
| Stored | only the 256-bit digest + salt — the password itself appears nowhere |
| Comparison | constant-time (no early-exit timing leak) |
| Session | `sessionStorage`, 8-hour expiry **and** 30-minute idle timeout |
| Throttling | 3 free attempts, then 5s → 10s → 20s … up to 15 minutes, persisted in `localStorage` so a refresh does not reset it |
| Indexing | the studio injects `noindex, nofollow` |

To change the password, regenerate the digest and replace `SALT_HEX` / `DIGEST_HEX`
in `src/lib/auth.ts`:

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');\
const d=c.pbkdf2Sync('admin'+String.fromCharCode(31)+'YOUR-NEW-PASSWORD',Buffer.from(s,'hex'),310000,32,'sha256').toString('hex');\
console.log('SALT_HEX =',s);console.log('DIGEST_HEX =',d)"
```

### مدخل الاستوديو — The studio entrance

There is **no text link** to the studio anywhere (removed from the footer links,
the explore list and the mobile menu). Two ways in:

1. **A small black circle at the very bottom of the footer**, on the last line
   beside the city name:

   ```
   © 2026 MALIKA · All rights reserved.    Blended in Cairo…    CAIRO, EGYPT ●
                                                                            ↑ tap
   ```

   20×20px, solid black on the near-black footer with a faint inner gloss, so it
   reads as a design detail rather than a control. It has no label, no tooltip
   and no hover colour; it is `aria-hidden` with `tabIndex={-1}`, so screen
   readers and keyboard users never reach it. The invisible hit area is ~40px
   for comfortable thumb tapping.

2. **Type the word `studio`** anywhere on the site while not focused in a text
   field — handy on a laptop.

Either route lands on the password screen, never straight into the studio.

### ⚠️ ما الذي يحميه هذا فعلياً — Honest security note

This is a **static front-end**: everything shipped to the browser can be read. The
PBKDF2 digest is irreversible, so **your password stays secret** even if someone reads
the bundle — but a skilled developer can still read the code and bypass the *UI* check.

That is deliberate layering:

- The **passcode** hides the studio from visitors, bots and casual snooping.
- The **dangerous capability — publishing to GitHub — is protected by real GitHub
  OAuth**, verified by GitHub's servers. Without your GitHub authorisation nobody can
  write to your repository, no matter what they do in the browser.

For a hard lock on the studio UI itself, put the deployment behind one of these
(5 minutes to set up, all free):

- **Cloudflare Access** (Zero Trust) — e-mail/OTP in front of `/#/studio`.
- **Netlify Identity** + role-gated function.
- **Vercel Deployment Protection** (password / SSO).

## الاستوديو والنشر — Studio → GitHub correctness

- Create/edit/delete a product and the change appears on the storefront instantly
  (persisted locally) and is marked **Unpublished changes**.
- The badge lives in the studio header, on the products tab and on the publish card.
- Publishing sends `{ products, settings, generatedAt }` to
  `src/data/products/catalog.json` through the GitHub Contents API (GET for the SHA,
  PUT to commit, `sha` omitted on first creation), shows the commit + repo links, and
  then clears the dirty badge and records **Last published**.
- Path is validated (must end in `.json`) and the owner falls back to the connected
  GitHub login.
- Every overlay (quick view, product form, bag, checkout) renders through a React
  **portal** so it is never clipped by a page's transform/animation, and sheets close
  automatically on navigation.

All message text lives in `src/lib/messaging.ts` (Arabic + English, bidi-safe
plain text). No payment is taken online.

## الكروت — Product card & motion

- Redesigned editorial card: rounded media stage with the product's accent gradient,
  badges, wishlist, hover "notes" strip, quick view, rating, from-price, in-card size
  selector (30/50/100 ml) and a single-tap add-to-bag with an animated success state.
- Grids: **1 card per row on phones**, 2 on tablets, 3 on desktop (4-column ready).
- Actions are isolated in a memoised `CardActions` subtree, so adding to the bag never
  re-renders the whole catalogue. QuickView only mounts when opened.
- Motion: softer scroll reveals, sheen sweep, press-scale (`press`), check-pop, page-in,
  marquee pause-on-hover — all disabled under `prefers-reduced-motion`.

## الموبايل — Mobile experience

- A dedicated mobile type scale (`src/index.css`): micro labels 8–10px become 12px,
  captions 13px, body 14.5px, product names 16px, and inputs are 16px so iOS never
  zooms on focus. Comfortable 40–48px tap targets.
- Sticky product purchase bar (size selector, add to bag, WhatsApp order).
- Bottom tab bar: Home · Shop · WhatsApp · Bag.
- Collapsible shop filters with an active-filter counter.
- Reading-progress line, safe-area padding for the iPhone home indicator,
  no horizontal overflow at 360px/390px.

## المتجر والإدارة — Studio & persistence

- Products, storefront contact details and the client bag are persisted in `localStorage`.
- Images are lazy-loaded; the shop reveals **6 products at a time**, so a large catalogue never blocks the page.
- Quick view modals mount only when opened.
- The Studio can create/edit/delete products, export/import the catalogue as JSON, change WhatsApp,
  Messenger, Instagram, email, address, hours and the free-shipping threshold.
- GitHub sign-in: **OAuth** (authorization code + state, exchanged by `api/github-oauth.ts`) with a
  fine-grained token fallback. Both are verified against `GET /user` and shown as `@login`.
- Reset restores the original 12 perfumes.

## النشر بضغطة واحدة — One-press publishing

A **Publish** button floats in the corner of every studio page. Edit everything
you want, then press it once.

**What one press does**

1. saves anything still sitting in an editor (the Site-content and Storefront
   forms register their unsaved drafts, and Publish takes the values straight
   from them — no waiting for a re-render);
2. skips the whole thing if nothing changed since the last publish from this
   browser — *every commit triggers a rebuild on your host*, so repeat clicks
   must not spam it ("Publish anyway" forces one);
3. commits `src/data/products/catalog.json` (products, store details, site
   content) in **one atomic commit**; if the file moved on GitHub in between it
   re-reads the sha and retries once instead of showing a conflict;
4. then **watches the site itself**: the site is one HTML file with the catalogue
   inlined, so once your host has rebuilt, the new `generatedAt` stamp is inside
   the page. The panel goes *Saved to GitHub → It's live → Reload to see it* from
   a real signal, not a guessed delay. If nothing changes within 6 minutes it
   says so and points at the commit and the build status instead of pretending.

**One-time setup (~2 minutes).** The first press opens a short setup panel:
repository (paste `owner/name` or the GitHub URL), branch, and a **fine-grained
token**. The panel's link opens GitHub's token form already filled in — name,
90-day expiry, `Contents: write` (URL parameters per GitHub's docs). You only
choose *Only select repositories → this repo*. **Test** checks the repository
and branch; the token's write permission can only be proven by writing, so it is
confirmed on the first publish and a clear message follows if it is missing.

**Why a token and not OAuth?** OAuth needs a server function plus an OAuth App,
and its session lives in `sessionStorage`, so you would sign in again in every
new tab — not one press. A fine-grained token works on any host, needs no
server, and can be limited to one repository and one permission. OAuth is still
there under *GitHub tab → Advanced*. Publishing on every *save* was rejected on
purpose: it would commit half-finished work and rebuild the site on each edit.

**Where the token lives.** *Remember on this device* (default) stores it in
`localStorage`; untick it and it stays in `sessionStorage` for that tab only.
Either way it is **never in the bundle and never committed**. A remembered token
can be used by anyone who can open this browser profile, so tick it only on your
own device, keep the repo-only/`Contents`-only scope, and let it expire. When it
does, the panel says "GitHub rejected the token" with a **Fix connection**
button. Fine-grained tokens cannot write to repositories where you are only an
outside collaborator (GitHub's documented limitation) — use a classic token or
OAuth there.

**Things to know**

- *Don't edit while it says "Going live…".* A new deployment changes the storage
  key, so this browser restarts from the published data; edits made in between
  are replaced. The panel warns about it, and the stale "unpublished changes"
  flag is cleared when a new build loads.
- The host must be connected to the repository (Vercel/Netlify/Pages). Without it
  the commit succeeds but the site never changes — you will see "Saved, not
  confirmed yet".
- Uploaded images travel inside the catalogue to every visitor; above ~1.5 MB the
  panel suggests image links instead.

Code: `lib/github.ts` (API, errors, access check, live check),
`context/PublisherContext.tsx` (state machine), `lib/studioDrafts.ts` (draft
registry), `pages/Admin/PublishDock.tsx`, `ConnectionForm.tsx`, `GithubPanel.tsx`.

## النشر على GitHub — OAuth (alternative) & auto deploy

1. Push the project to a GitHub repository (branch `main`).
2. Import that repository in **Vercel** or **Netlify** (build command `npm run build`, output `dist`).
3. Create a **GitHub OAuth App** (Settings → Developer settings). Callback URL = the site root,
   e.g. `https://your-store.vercel.app/`.
4. Deploy the relay in `api/github-oauth.ts` with `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and
   `ALLOWED_ORIGIN` (see `api/README.md`).
5. Open `#/studio` → **GitHub publish** → *Advanced*: paste the OAuth **Client ID**, keep the relay at
   `/api/github-oauth`, choose `public_repo` or `repo`, press **Connect GitHub** and approve.
6. Publish with the floating button. `src/data/published.ts` uses the committed `catalog.json` as the
   catalogue when it contains products (the 12 hand-written products are the fallback before the first
   publish). The catalogue timestamp versions the local storage key so the fresh deployment wins over
   stale local edits.

### Why a relay?

GitHub's OAuth token endpoint needs the OAuth app's **client secret** and does not allow browser
CORS requests. The front-end therefore cannot exchange the OAuth `code` by itself. The browser sends
the code to `api/github-oauth.ts`, which performs the exchange server-side; the client secret never
reaches the bundle. A **personal access token** connection is still available as a local fallback.

> **Security note:** the OAuth access token is kept in `sessionStorage` and sent only to `api.github.com`.
> OAuth proves *which* GitHub account is connected, not *who* may administer the store. Protect
> `#/studio` with a staff password/Netlify Identity or a server-side check before production, and
> restrict `ALLOWED_ORIGIN`. Never commit a client secret or token.

## التصميم — Design system

- Brand: **مليكة · MALIKA** — Arabic for *queen*; the house is built around regal, lasting presence. Rename it in
  `src/data/site.ts` (`BRAND`) and the `brand.*` keys in `src/i18n/translations.ts`.
- Palette: ink plum `#141019`, bone `#F3EFE7`, lilac `#C9B5F7`, acid lime `#DDF25C` — modern, not the
  usual perfume gold/beige.
- Type: Instrument Serif (Latin display) + Manrope (Latin UI) + IBM Plex Sans Arabic (Arabic display/UI).
- Motion: IntersectionObserver reveals, marquees, floats, sheen sweeps, drawer/modal transitions; all
  reduced-motion aware.
- WhatsApp / Messenger order messages are generated bilingually in `src/lib/messaging.ts`.
