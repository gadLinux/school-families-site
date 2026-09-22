# Backend (PocketBase)

[PocketBase](https://pocketbase.io) (single binary + SQLite) stores accounts,
"A mí también" and moderated comments. The site stays static: the browser
talks to PocketBase at `/api` on the same origin.

## Local development

```bash
./pb/dev.sh                 # PocketBase on 127.0.0.1:8090 + Mailpit on 127.0.0.1:8025
cd web && npm run dev       # Astro proxies /api to PocketBase
```

- **Configuration** lives in `pb/.env` (git-ignored); `dev.sh` loads it on
  start. Generate it from Ansible Vault, where the Gmail app password is kept
  encrypted: `cd ansible && ansible-playbook playbooks/pb-env-local.yml --ask-vault-pass`
  (see `../ansible/README.md` → Secrets). [`.env.example`](.env.example)
  lists every variable.
- **Emails** (login codes, moderation notices) land in Mailpit:
  http://127.0.0.1:8025. Nothing is really sent, even if `pb/.env` has real
  Gmail settings. To test real sending: `PB_DEV_REAL_SMTP=1 ./pb/dev.sh`.
- **Admin panel** (moderation): http://127.0.0.1:8090/_/. Create a superuser
  once with `pb/bin/pocketbase superuser upsert <email> <password> --dir pb/pb_data`.
- Data lives in `pb/pb_data/` (gitignored). Delete it to start from scratch;
  migrations run again on the next start.

## Data model (`pb_migrations/`)

| Collection | Type | Who can read | Notes |
|---|---|---|---|
| `users` | auth | only the owner | Login by one-time code sent by email (OTP); password auth is disabled. `seudonimo` is the only public field. |
| `a_mi_tambien` | base | only the owner | One per account and story (unique index). Can be undone. |
| `a_mi_tambien_conteo` | view | public | Count per story, without who. |
| `comentarios` | base | only the author | Always created as `pendiente`; only a superuser can publish or reject. |
| `comentarios_publicos` | view | public | Published comments with pseudonym, no email or user id. |
| `comentarios_conteo` | view | public | Published comments per story. |
| `propuestas` | base | only the author | Families' proposals for the data page: research lines, data to analyse or errors. `tipo`, optional `bloque` (chart id) and `enlace`. Always created as `pendiente`. |
| `propuestas_publicas` | view | public | Proposals in `en_estudio`, `incorporada` or `descartada`, with the moderator's `respuesta` and the pseudonym. `rechazada` ones are never shown. |
| `experiencias` | base | published: everyone; pending: the author and moderators | Stories written on the site. Markdown `cuerpo`, up to 10 `adjuntos` (JPEG, PNG, WebP, GIF, PDF; 5 MB each) and `adjuntos_citas` (how each file is cited in the text, same order). The hook sets `seudonimo`, `slug` and `estado = pendiente`. Only moderators can update or delete. |
| `moderadores` | base | each moderator sees their own row | Who can moderate stories. Only a superuser can add rows, from the admin panel, so nobody can make themselves a moderator. |

Comments and «A mí también» reference stories by slug (`experiencia`), for
both the static stories and the ones in `experiencias`.

Attachments are cited in the Markdown as `adjunto:a1.jpg`. PocketBase renames
files when it stores them (`a1.jpg` → `a1ond2jpeoy9_w5drsy7bbr.jpg`), so the
site resolves each citation by its position in `adjuntos_citas`, never by the
stored file name.

## Hooks (`pb_hooks/`)

- `correo.pb.js`: app name, sender and SMTP from environment variables on every
  start, so credentials are never stored in the repo or the database:
  `PB_APP_URL`, `PB_SENDER`, `PB_SMTP_HOST`, `PB_SMTP_PORT`, `PB_SMTP_USER`,
  `PB_SMTP_PASS`.
- `comentarios.pb.js` and `propuestas.pb.js`: force `estado = pendiente` whatever the request says,
  run the pre-filter in `moderacion.js`, and email the moderator
  (`PB_AVISOS`, default: the contact address).
- `experiencias.pb.js`: the same for stories, plus the pseudonym, a unique
  slug and a check of `adjuntos_citas`. When a moderator publishes or rejects
  a story, it sets the publication date and emails the author (with the
  reason, if rejected). Links in emails use `PB_WEB_URL`.
- `avisos.js` and `moderacion.js` are plain modules loaded with `require()`:
  PocketBase runs each hook callback in isolation, so shared helpers cannot be
  top-level functions of a `.pb.js` file.

## Moderating

**Stories** are moderated on the site, at `/moderacion`: each pending story is
shown as it will look, with its attachments, and can be published or rejected
with a reason. The link appears in the header for moderators only. To make
someone a moderator, add their account to `moderadores` in the admin panel.
To correct a story before publishing it (for example to remove a name), edit
it in the admin panel.

For comments and proposals, use the admin panel (`/_/`) and filter by
`estado = "pendiente"`:

- **Comments** (`comentarios`): set each one to `publicado` or `rechazado`,
  optionally with `motivo_rechazo`.
- **Proposals** (`propuestas`): set each one to one of these, and write a
  short public `respuesta` saying why or where it was added:
  - `en_estudio`
  - `incorporada`
  - `descartada`
  - `rechazada`: spam or personal data. It is never published.

## Production (not deployed yet)

The server needs the same variables as `pb/.env` (see
[`.env.example`](.env.example)), loaded by the systemd service with
`EnvironmentFile=`, rendered from `../ansible/templates/pb.env.j2`. The
Gmail app password must never be committed in clear: it lives only in
`ansible/inventory/group_vars/all/vault.yml`, encrypted. Then add the moderators' accounts to
`moderadores`.

Pending in `../ansible`:

- PocketBase as a systemd service bound to 127.0.0.1.
- nginx `location /api/` proxying to it.
- Copy the environment file to the server (mode 600) for the service.
- Daily `sqlite3 .backup` of `pb_data`.
- The admin panel (`/_/`) should only be reachable through an SSH tunnel.
