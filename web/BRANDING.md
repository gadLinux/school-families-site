# Brand and style guide

How familiasdiegovelazquez.es looks, sounds and highlights things. Read this
before adding a section, so new pages feel like the rest of the site.

The site's text is in **Spanish**; this guide and the code docs are in English.

## 1. Principles

These come first. When a visual choice conflicts with them, they win.

| Principle | What it means in practice |
|---|---|
| **Declared independence** | Header and footer say it is an initiative by families, with no link to the school or its parents' association (AMPA). Never use the school's logo, colours or imagery. |
| **Real neutrality** | Show what works well too. When a figure favours the school, publish it (e.g. ESO graduation rate) and say so in the text. |
| **Source for every figure** | Every number links to its original, with page. Estimates are marked. |
| **Ask, don't accuse** | Describe the data and ask an open question. Never state a hypothesis as fact. |
| **People are protected** | No names of students or staff, no photos of minors, pseudonyms only. |
| **Readable by anyone** | Large type, high contrast, keyboard access, works on a phone. |

## 2. Voice and tone (Spanish copy)

The tone is **warm, close and calm**: families talking to families, not an
institution and not a protest.

- **Write to "tú"**, in short sentences and plain words. Avoid legal or
  statistical jargon. When a term is unavoidable, explain it once
  («ratio: alumnos por grupo»).
- **Say "familias"**, not "padres", and "alumnado" or "alumnos", not "niños".
- **Headings are questions or plain statements**: «¿Quién llega a la PAU?»,
  «Alumnos que obtienen el título de ESO». Never use slogans or superlatives.
- **Open questions** go in italics with the accent bar (`.bloque__pregunta`),
  one per block.
- **Numbers follow Spanish format**: `64,25 %` (comma decimal, space before %),
  `2025-26`, `2.º ESO`. Use the helpers `pct()` and `dec()` in `src/lib/csv.ts`,
  never hand-format.
- **Status messages are short and human**: «Gracias. Lo revisaremos antes de
  publicarlo.» Never "Success" or error codes (`mensajeError()` translates
  them).
- **Words to avoid**:
  - Claims of intent: «manipula», «engaña», «oculta».
  - Superlatives: «escándalo», «gravísimo».
  - Anything that labels a group or a person.

## 3. Colour

Light theme only (`color-scheme: light`). All colours are CSS custom properties
in [`src/styles/global.css`](src/styles/global.css). **Never hard-code a hex
value in a component**; add a token if one is missing.

### Palette

| Token | Hex | Role | Text on `--bg`? |
|---|---|---|---|
| `--bg` | `#fbf8f3` | Page background (warm cream) | — |
| `--surface` | `#ffffff` | Cards, blocks, forms | — |
| `--text` | `#1f2328` | Body text | ✅ 14.9:1 |
| `--muted` | `#5b6168` | Secondary text, notes, metadata | ✅ 5.9:1 |
| `--border` | `#e7e1d6` | Hairlines and card borders | — |
| `--accent` | `#2f7d6d` | Brand colour: links, buttons, the school's series in charts | ✅ 4.6:1 |
| `--accent-contrast` | `#ffffff` | Text on accent backgrounds | ✅ 4.9:1 on accent |
| `--compare` | `#c27c3a` | The comparison series in charts (Comunidad de Madrid) | ❌ fills only |
| `--compare-text` | `#9b632e` | Text in the comparison colour | ✅ 4.7:1 |
| `--shared` | `#b8452f` | Shared topics and "!" alerts | ✅ 5.0:1 |
| `--debate` | `#a86b00` | In discussion, estimates, pending items | ❌ fills only |
| `--debate-text` | `#976000` | Text in the debate colour | ✅ 5.0:1 |

Contrast is WCAG 2.1 against `--bg`; the minimum for body text is 4.5:1.
`--compare` and `--debate` are only for fills, lines and borders. For text in
those colours use their `-text` variants.

### Using colour

- **One meaning per colour.**
  - `--accent` = the site and the school.
  - `--compare` = the region, or whatever the school is compared with.
  - `--shared` = "look at this".
  - `--debate` = "not settled yet".
- **At most two data colours per chart**, three only when the comparison
  really needs it (e.g. the PAU grade chart). Grey (`#9aa1a8`) is the neutral
  third series.
- **Never use colour as the only signal.** Every highlight also has a shape,
  pattern or word (see §5).
- **Tints come from `color-mix()`**, not new hex values. Example:
  `color-mix(in srgb, var(--shared) 8%, var(--surface))` for the alert
  background.
- Story categories have their own icon colours in `src/data/categorias.ts`.
  Those are only for the small circle behind the category emoji.

## 4. Typography and layout

| Element | Font | Size / weight |
|---|---|---|
| Body | Atkinson Hyperlegible (self-hosted, `@fontsource`) | 20px root (`font-size: 125%`), line-height 1.6; 400 and 700 |
| Headings `h1`-`h3` | Source Serif 4 | 600, line-height 1.2 |
| Key figures (`.bloque__cifra strong`) | Source Serif 4 | 1.8rem, accent |
| Source codes (`[F002]`) | System monospace | 0.8rem |

Atkinson Hyperlegible was designed for low-vision readers. Do not add more
fonts or weights.

**Readers are mostly 40 or older.** Keep text large: nothing below `0.85rem`
(17px), except the «Beta» badge. Secondary text (dates, notes, labels) uses
`0.85rem`–`0.9rem`.

**Layout rules:**

- **Content width**: `.container` (max 68rem, 1rem side padding). Keep reading
  text at max ~44rem.
- **Breakpoints** (mobile first):
  - Phone: under 600px.
  - Tablet: 600-959px.
  - Desktop: 960px and up.
  - Two-column grids start at 960px.
- **Radius**:
  - `--radius` (12px) for cards and blocks.
  - 8px for inputs and small panels.
  - 999px for pills and buttons.
- **Spacing**: sections are separated by `3rem`; inside a block use
  `0.25-0.75rem` steps.
- **No horizontal page scroll at 375px.** Wide tables scroll inside their own
  container (`overflow-x: auto`).

## 5. Highlighting: signals and when to use them

The site has a small, fixed set of signals. **Do not invent new ones.** Reuse
these with the same meaning, and follow the criteria in each row, so readers
learn them once.

| Signal | Looks like | Means | Use it when | Where it lives |
|---|---|---|---|---|
| **"!" alert** | Red circle "!", red side border, «Merece análisis:» box | A discrepancy or a figure worth a closer look | Two sources disagree, a figure changes sharply, or an official figure differs from what the school publishes. **Not** for opinions. If the data also favours the school, say so in the same text | `BloqueDato` prop `alerta` |
| **Estimate** | Dashed ochre «ESTIMACIÓN» badge; hatched bars with dashed border; values prefixed `~` | Calculated by us, not an official figure | No official figure exists and the method is written in the notes | `BloqueDato` prop `estimacion`; series `estimada: true` |
| **Minimum / bound** | Hatched segment, value prefixed `≥` or `≤` | A bound derived from official figures (e.g. with a legal rule), not an estimate | The bound is exact given the sources, with the formula in the notes | `Apiladas` tramo `minimo: true` |
| **Shared topic** | Red ring and «🤝 Compartido por N familias» ribbon; listed on the home page | Several families report the same thing | `aMiTambien ≥ COMPARTIDO_MIN` (4) and not in discussion | `ExperienceCard`, `src/lib/reglas.ts` |
| **In discussion** | Tinted card, dashed outline, «⚖️ Opiniones divididas» ribbon, agreement bar; own column | Families disagree | ≥ 10 votes and minority ≥ 35 % | `ExperienceCard`, `src/lib/reglas.ts` |
| **Pending** | Dashed border, ochre «Pendiente de revisión · solo lo ves tú» (`.etiqueta-pendiente`) | Waiting for moderation; only its author sees it | Any user content not yet approved | `Comentarios`, `Propuestas`, story cards and pages |
| **Beta** | Small ochre outlined «BETA» pill next to the site name | The site is still being tested | Until the site leaves its test phase | `Base.astro` (`.beta`) |
| **Truncated axis note** | Muted note «El eje empieza en…» | The chart does not start at 0 | Any line chart whose axis does not start at 0 | `BloqueDato` `notas` |

**Rules of thumb:**

- **At most one alert per block.** Do not put alerts on every block: if
  everything is highlighted, nothing is.
- **Strong words go in the data, not the styling.** The alert box says what
  differs and by how much, never why.
- **Signals combine** (e.g. an estimate with an alert), but each keeps its own
  look.

## 6. Components

Reuse before creating. All live in `src/components/`.

| Component | Use for |
|---|---|
| `layouts/Base.astro` | Every page: title, header with nav and session button, footer, login dialog |
| `graficos/BloqueDato.astro` | Any data block, with the template: title → alert → legend → chart → key figure → description → question → notes → table → sources → "Proponer" link → CSV download |
| `graficos/Barras.astro` | Grouped vertical bars (starts at 0, value labels on bars) |
| `graficos/Lineas.astro` | Time series (last value labelled, optional `discontinua` series) |
| `graficos/Apiladas.astro` | Horizontal stacked bars showing who is in and out of a percentage |
| `ExperienceCard.astro` | Story card: tilt, ribbons, "A mí también", votes |
| `Comentarios.astro` | Moderated conversation under a story |
| `Propuestas.astro` | Families' proposals for the data page |
| `Acceso.astro` | Passwordless login dialog (included in `Base`) |
| `pages/experiencias/nueva.astro` | Story editor (Markdown, attachments, preview) |
| `pages/moderacion.astro` | Moderators review and approve stories |

Shared classes in `global.css`:

- `.container`
- `.intro__lead`
- `.btn` (filled pill: the main action on a screen)
- `.btn--ghost` (outlined: secondary action)
- `.btn-metoo`
- `.visually-hidden`
- `.prosa` (text rendered from Markdown)
- `.etiqueta-pendiente`

**Charts:**

- Plain SVG rendered at build time; no chart library, no browser JS.
- Always include the data table (`slot="tabla"`) and the CSV download.
- Label values on the chart so nobody needs to read the axis.
- See [`README.md` → Chart rules](README.md#chart-rules).

**Cards** are tilted between ±1.5° and ±3° by position (deterministic), and
straighten on hover and focus. The tilt is halved on phones and removed with
`prefers-reduced-motion`. Only story cards tilt: data blocks stay straight,
because they are meant to be read carefully.

## 7. Icons and imagery

- **Emoji as icons**, one per concept, always next to a text label (never
  alone):
  - 🤝 A mí también / shared.
  - ⚖️ In discussion.
  - 💬 Conversation.
  - 💡 Proposals.
  - 📎 Attachments.
- The emoji itself gets `aria-hidden="true"`.
- **No photos of people.** No stock images, and nothing from the school
  (logo, building photos, crest).
- The favicon is the only graphic mark (`public/favicon.svg`).

## 8. Accessibility checklist

- [ ] Text contrast is at least 4.5:1 (use the tokens in §3; `-text` variants
  for ochre and orange).
- [ ] Focus is visible (`:focus-visible` outline in `--compare`, 3px). Do not
  remove outlines.
- [ ] Every chart has a `<title>`, a visible legend and a table alternative.
- [ ] Forms have a `<label>` for each field. Errors are announced (`role="alert"`
  or `role="status"`).
- [ ] Buttons that toggle use `aria-pressed`.
- [ ] Works at 375px wide with no horizontal scroll. Grid columns use
  `minmax(0, 1fr)` and form fields `width: 100%` with `box-sizing: border-box`,
  so a long option or a wide table cannot push the page wider.
- [ ] Elements created with JavaScript do not get the component's scoped
  styles: style them with `:global()` or in `global.css`.
- [ ] Motion respects `prefers-reduced-motion`.
- [ ] User content is inserted with `textContent`, never `innerHTML`.

## 9. Adding a new section

1. **Page:** create `src/pages/<name>.astro` using `Base`, with a short
   Spanish `title` and `description`.
2. **Nav:** add a link in `Base.astro` with `aria-current`.
3. **Intro:** open with an `h1`, then one or two lines in `.intro__lead` saying
   what the section is for.
4. **Blocks:**
   - For data, use `BloqueDato` and the chart rules.
   - For stories, use `ExperienceCard`.
   - For participation, reuse `asegurarSesion()` from
     `src/lib/participacion.ts` and moderate everything (new PocketBase
     collections follow `../pb/README.md`).
5. **Signals:** apply only the ones in §5, with their criteria.
6. **Copy:** check it against §2 (tone, format, words to avoid).
7. **Check:** `npm run check`, `npm run build`, then look at desktop and 375px,
   and go through the §8 checklist.
