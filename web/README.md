# Web app

Static site built with [Astro](https://astro.build). It is served by nginx on the
server (see [`../ansible`](../ansible)).

## Development

```bash
npm ci
npm run dev      # http://127.0.0.1:4321
npm run check    # type check (astro check)
npm run build    # production build into dist/
npm run preview  # serve dist/ locally
npm run sync-datos  # refresh public/datos/ from the research CSVs (see below)
```

"A mí también", comments and login need the backend running:
`../pb/dev.sh` (see [`../pb/README.md`](../pb/README.md)). Without it the
pages still work and show the starting counts.

Stories come from two places:

- **`src/data/experiencias.ts`**: stories written by the site owners, built
  into the pages (`/experiencias/<slug>`).
- **PocketBase (`experiencias`)**: stories families write at
  `/experiencias/nueva`. They are loaded in the browser, so an approved story
  appears straight away without a rebuild: as a card on `/experiencias` and
  at `/experiencias/ver?e=<slug>`. The author also sees their own pending
  stories, marked «Pendiente de revisión». Moderators approve them at
  `/moderacion` (see `../pb/README.md`).

Only real, moderated stories are published: never fictitious ones, and
nothing that identifies a student or a member of staff.

### The story editor

- **Markdown** with a toolbar (bold, italics, subheading, list, quote, link)
  and a «Vista previa» tab. Rendering and sanitising live in
  `src/lib/markdown.ts` (`marked` + `DOMPurify`): hand-written HTML is shown as
  text, and every link to another site gets `rel="nofollow ugc noopener"`.
- **Attachments**: up to 10 images or PDFs, 5 MB each. They are cited in the
  text as `adjunto:a1.jpg`; images are embedded where the cursor was, PDFs are
  linked. Only attachments are shown as images: an image from another site
  becomes a plain link, so readers never load third-party content.
- **Photos are redrawn in a canvas before upload**, which drops hidden
  metadata (GPS location, phone model) and shrinks very large pictures. PDFs
  are uploaded as they are: moderators must open them.
- The draft (text only) is kept in the browser's `localStorage` until it is
  sent.
- The PocketBase SDK cancels a request when an identical one starts, so story
  queries that run in parallel use `requestKey: null`.

### Publishing stories

Stories are about a real school and real people, so every text must pass
these checks before it goes into `src/data/experiencias.ts`:

- **No names** of students or staff, and no data that singles out a student
  (health, diagnosis, exact grades, amounts or dates of a family's case).
  Generalise instead: «más de un 4», «más de 100 €», «un día».
- **Facts we can back up**, or reports clearly framed as such («según nos
  cuenta nuestra hija…»). Opinions are written as opinions, and conclusions
  as open questions.
- **No insults and no claims of intent.** LO 1/1982 art. 7.7 treats as an
  unlawful intrusion any statement of facts or value judgements that damages
  someone's dignity.
- **Minors are never named**, not even with the family's consent
  (LO 1/1996 art. 4.3).
- **The site owners' own stories** use the single pseudonym `Owner` and start
  every counter at 0, so they never look like several families.
- **Links** go in the body as `[text](/datos#block-id)` or `[text](https://…)`
  (`src/lib/enlaces.ts`). Other addresses are left as plain text. Link a
  claim to its data block or to the official text of the law when possible.
- **Stories that touch an ongoing claim** do not mention escalating it to the
  education authorities (see the project's rules for written claims).

## Look and feel

Colours, type, tone of voice, highlighting signals (and when to use them), the
component catalogue and a checklist for new sections are in
[`BRANDING.md`](BRANDING.md).

## Experiences: rules and thresholds

All thresholds live in one module, [`src/lib/reglas.ts`](src/lib/reglas.ts),
so they can be tuned without touching the layout. Ordering and column
assignment are in [`src/lib/ranking.ts`](src/lib/ranking.ts).

| Constant | Value | Meaning |
|---|---|---|
| `COMPARTIDO_MIN` | `4` | Minimum "A mí también" (*me too*) count for a story to be a **shared topic** ("more than 3 people"). |
| `DISCUSION_MIN_VOTOS` | `10` | Minimum total votes (▲ + ▼) before a story can be considered **in discussion**. |
| `DISCUSION_MIN_MINORIA` | `0.35` | Minimum share of the minority vote (▲ or ▼) for the split to count as **divided**. |
| `VIDA_MEDIA_DIAS` | `30` | **Aging** half-life in days: relevance halves every 30 days. |
| `SUELO_ENVEJECIMIENTO` | `0.25` | Aging floor: relevance never drops below 25 %, so stories age but never disappear. |

### Shared topics

A story is shared when `aMiTambien >= COMPARTIDO_MIN` **and** it is not in
discussion. A disputed topic is not presented as a shared problem until the
disagreement settles.

Shared stories get a highlighted card ("🤝 Compartido por N familias") and the
top 5 appear on the home page, sorted by "A mí también" count.

### In discussion

```
total    = ▲ + ▼
minority = min(▲, ▼) / total
inDiscussion = total >= DISCUSION_MIN_VOTOS && minority >= DISCUSION_MIN_MINORIA
```

Examples: 19 ▲ / 16 ▼ (35 votes, 46 % minority) is in discussion;
30 ▲ / 5 ▼ (14 % minority) is not; 3 ▲ / 2 ▼ is not either, because 5 votes
are too few to tell.

These stories are moved to the **"⚖️ En discusión"** column. They are sorted by
debate intensity, `total × minority`, so the most voted and most even debates
come first.

### Aging and relevance

```
aging     = SUELO + (1 − SUELO) × 0.5 ^ (days_since_published / VIDA_MEDIA_DIAS)
relevance = (1 + 2 × aMiTambien + max(0, ▲ − ▼)) × aging
```

- "A mí también" weighs twice as much as an up vote, because it shows the
  problem repeats.
- Votes count by their net balance, and a negative balance counts as 0.
- The `+1` base lets aging still order stories with no interaction.
- Ties (e.g. stories with no votes published at the same moment) are broken
  by date, newest first. Give `publicada` a time (`2026-09-22T16:50`) when
  several stories are published on the same day.
- The order is computed at build time: new «A mí también» clicks update the
  counters in the browser straight away, but only reorder the cards on the
  next build.

The aging factor over time:

| Age | Factor |
|---|---|
| New | 1.00 |
| 30 days | 0.63 |
| 60 days | 0.44 |
| 90 days | 0.34 |
| Old | → 0.25 |

Stories that are not in discussion are sorted by relevance and laid out
round-robin across the two story columns.

### Tuning tips

- Changing `DISCUSION_MIN_MINORIA` changes which stories count as divided:
  - `0.40`: only near-ties are divided.
  - `0.30`: more topics go to discussion.
- Keep `DISCUSION_MIN_VOTOS` high enough that small samples do not count as a
  debate.
- A shorter `VIDA_MEDIA_DIAS` gives more room to new stories. A higher
  `SUELO_ENVEJECIMIENTO` keeps well-supported old stories visible for longer.

After changing a value, run `npm run dev` and check how cards move between
columns.

## Data page (`/datos`)

Charts of public and aggregated figures about the school, grouped by topic.
Every chart links to its original source, with the exact page.

### How it works

- The CSV files in [`public/datos/`](public/datos) are the single source for
  both the charts and the downloads. The page reads them at build time
  (`src/lib/csv.ts`), so a chart can never disagree with its CSV.
- They are copies of the research CSVs, which live outside this repo.
  `npm run sync-datos` refreshes them; the list of published files is in
  [`scripts/sync-datos.mjs`](scripts/sync-datos.mjs). Only add files that are
  public or aggregated, never personal data.
- **Every CSV travels with its provenance.** Next to each `name.csv` there is a
  `name.meta.json` (sources with document, page, URL and retrieval date;
  extraction method; status; notes). `sync-datos` refuses to publish a CSV
  without it, and `leerMeta()` in `src/lib/csv.ts` fails the build if one is
  missing. Both files are published, so readers can download the provenance.
- **Validation counter.** Each meta has a `validacion` block: `validado`
  (the local copy was checked against the original source), `veces` (how many
  times that check has been done) and `historial`. Extracting a figure is not
  validating it: validation is a later, separate check against the original.
  Register one with
  `python3 scripts/util/registrar_validacion.py <file>.csv --alcance completa|parcial --resultado ok|discrepancia --nota "…"`
  (from the research root), then `npm run sync-datos`. Each block on `/datos`
  shows, next to its download, how many times its CSV has been checked.
  `registrar_validacion.py --comprobar` lists any CSV without metadata.
- Sources are listed in [`src/data/fuentes.ts`](src/data/fuentes.ts). The
  `Fxxx` codes match the research data register.
- Charts are plain SVG rendered at build time
  ([`src/components/graficos/`](src/components/graficos)). No chart library
  and no JavaScript in the browser.

### Chart rules

Each block follows the same template (`BloqueDato.astro`):

1. Chart.
2. Key figure.
3. Neutral description.
4. Open question.
5. Notes.
6. Data table.
7. Sources and CSV download, with its provenance file and validation count.

- **Bars start at 0.** A line chart may start higher (e.g. 90 %), but only
  with visible axis ticks and a note saying so.
- **Estimates** get the `estimacion` flag: a visible "Estimación" badge, and
  hatched bars with a dashed border (`estimada: true` on the series). The
  method goes in the notes.
- **Ask, don't accuse.** Describe the figure and ask an open question. Never
  state a hypothesis as a fact.
- **Only compare like with like.** If two figures use different
  denominators, either say so in a note or do not put them side by side.
  Example: the Comunidad de Madrid's 99.63 % counts people registered for the
  PAU who sat the exam, not 2.º Bachillerato students, so the page does not
  compare it with the school's estimated rate.
- **At most two colours per chart**, and value labels on the bars.
- **Discrepancies get a "!" marker.** Pass `alerta="…"` to `BloqueDato`, with
  one or two sentences saying what is worth analysing. Use it only for a real
  discrepancy between sources, or a figure that stands out. It is not an
  opinion. When the data favours the school, say so in the same text.
- **Every block has a "Proponer algo sobre este dato" link.** It pre-fills the
  proposals form (`src/components/Propuestas.astro`) at the end of the page.
  Families' proposals are moderated in PocketBase (see `../pb/README.md`).
