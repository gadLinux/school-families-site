# Deployment (Ansible)

Deploys the site to a single Ubuntu server: the static web (Astro), nginx on
the host with HTTPS (Let's Encrypt via certbot) and PocketBase, the
participation backend.

```
Internet :80/:443 ─→ nginx (host)
                      ├── <site_domain> (+ www) ─→ /srv/<site>/current (static)
                      │                    /api ─→ 127.0.0.1:8090 PocketBase
                      └── optional: another site on the same server
                                           ─→ 127.0.0.1:8081 (its own container)
```

## Private files

Server details and secrets never go into the repository. Create these files
locally; they are git-ignored:

| File | What | Template |
|---|---|---|
| `inventory/production.yml` | Server address and SSH user | [`examples/production.yml`](examples/production.yml) |
| `inventory/group_vars/all/vault.yml` | Secrets, encrypted with Ansible Vault | see [Secrets](#secrets-ansible-vault) |
| `inventory/group_vars/all/otra_web.yml` | Optional: another site sharing the server | [`examples/otra_web.yml`](examples/otra_web.yml) |
| `.vault_pass` | Optional: the vault password, to avoid typing it | — |

## Usage

Requirements: `ansible-core` ≥ 2.16, Docker (for the local test), Node.js 24.

```bash
cd ansible

# Local test: renders the real nginx templates and runs them in Docker
ansible-playbook tests/test-local.yml

# Dry run against the server (changes nothing)
ansible-playbook playbooks/site.yml --check --diff --vault-password-file .vault_pass

# Full install or update (idempotent): web, nginx, PocketBase, certificate
ansible-playbook playbooks/site.yml --vault-password-file .vault_pass

# Everyday: publish a new version of the web only
ansible-playbook playbooks/deploy-web.yml --vault-password-file .vault_pass
```

`site.yml` runs in two phases so that a site already holding 80/443 is down
for as short a time as possible:

1. `--skip-tags arranque`: publishes the web, configures nginx **without
   starting it** and starts PocketBase.
2. Without tags: checks that the other site (if any) listens only on
   localhost, starts nginx and requests the certificate.

With no other site on the server, just run it once without tags.

## Layout

```
ansible.cfg
examples/                    templates for the private files
inventory/
  production.yml             private: server and user
  group_vars/all/
    main.yml                 domain, paths
    pocketbase.yml           PocketBase environment (no secrets)
    vault.yml                private, encrypted
    otra_web.yml             private, optional
templates/pb.env.j2          PocketBase .env (server and ../pb/.env)
playbooks/
  site.yml                   full install (idempotent)
  deploy-web.yml             web only
  pb-env-local.yml           writes ../pb/.env from the vault
  rollback-convivencia.yml   stops host nginx so the other site can take 80/443 back
roles/
  web/                       builds locally and publishes a release
  nginx_proxy/               nginx, one vhost per domain, TLS, certbot
  pocketbase/                binary, systemd service, env file, daily backup
  convivencia/               checks the other site listens only on localhost
tests/test-local.yml         nginx test in Docker
```

## nginx

- **One vhost per domain**, each in its own file in `sites-available`:
  `00-default`, `<site_domain>` and, if enabled, `otra-web`.
- **Our site**: HTTP redirects to HTTPS and `www` to the main domain, except
  the ACME challenge. Security headers and a CSP on every response; hashed
  assets (`/_astro/`) are cached for a year. `/api/` is proxied to PocketBase;
  the PocketBase admin panel (`/_/`) is not exposed.
- **Unknown hosts**: HTTP is closed without an answer (444), or forwarded to
  the other site if it is enabled (so it keeps answering on its IP as
  before). HTTPS handshakes are rejected.
- **Certificates**: certbot in webroot mode (`/var/www/certbot`). Renewal is
  handled by the system `certbot.timer`; a deploy hook reloads nginx.

## PocketBase

- systemd service `pocketbase`, bound to `127.0.0.1:8090`, running as its own
  user with a hardened unit (it can only write to its data folder).
- Data: `/srv/<site>/pb/pb_data`. Migrations and hooks are copied from `../pb`.
- Environment: `/etc/<site>/pb.env` (mode 600), rendered from
  `templates/pb.env.j2` and the vault.
- Daily backup at 04:15 (`sqlite3 .backup`) into `/var/backups/<site>`,
  kept 14 days.
- **Admin panel**, through an SSH tunnel only:

  ```bash
  ssh -N -L 8090:127.0.0.1:8090 <user>@<server>
  # then open http://127.0.0.1:8090/_/
  ```

- **First superuser** (once, on the server):

  ```bash
  sudo -u pocketbase /srv/<site>/pb/bin/pocketbase superuser upsert <email> '<password>' --dir /srv/<site>/pb/pb_data
  ```

- **Moderators**: log in on the site once, then add that account to the
  `moderadores` collection from the panel.

## Another site on the same server (optional)

If the server already hosts another site that publishes 80/443 from its own
container, both can coexist: its container must publish only on localhost
(for example `127.0.0.1:8081`) and host nginx forwards its domain to it.

- Configure it in `inventory/group_vars/all/otra_web.yml` (see the example).
- **This project never changes the other site's configuration.** The port
  change belongs to its own project; otherwise its next deploy would take
  80/443 again. The `convivencia` role only checks it before starting nginx.
- `playbooks/rollback-convivencia.yml` stops host nginx so the other site can
  take 80/443 back.

## Secrets (Ansible Vault)

The only secret is the Gmail app password PocketBase uses to send email. It
lives encrypted in `inventory/group_vars/all/vault.yml` as
`vault_pb_smtp_pass`; `pocketbase.yml` maps it to `pb_smtp_pass`. Variables
live next to the inventory so every playbook loads them, wherever it is.

Create the vault once (you choose the vault password; keep it in a password
manager):

```bash
cd ansible
read -rs -p "Vault password: " V; echo
printf '%s' "$V" > .vault_pass && chmod 600 .vault_pass && unset V
read -rs -p "Gmail app password: " P; echo
printf 'vault_pb_smtp_pass: "%s"\n' "$P" | ansible-vault encrypt --vault-password-file .vault_pass --output inventory/group_vars/all/vault.yml -
unset P
```

Everyday commands:

```bash
ansible-vault edit inventory/group_vars/all/vault.yml --vault-password-file .vault_pass
ansible-playbook playbooks/pb-env-local.yml --vault-password-file .vault_pass   # writes ../pb/.env
```

Rules:

- `vault.yml` is git-ignored: it is not published even encrypted. CI also
  fails if any `*vault*.yml` is ever committed unencrypted.
- Never write the app password in `pocketbase.yml`, `.env.example`, a
  command line or a chat.
- If it leaks, revoke it at https://myaccount.google.com/apppasswords, create
  a new one and run `ansible-vault edit`.
