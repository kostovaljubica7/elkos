# elkos.mk

Static HTML business site for **elkos.mk**, served from a Docker nginx container on a DigitalOcean droplet. Deployed via `rsync` over SSH from this repo.

---

## Quick access

```bash
ssh -i ~/.ssh/keys/elkoskey root@159.223.216.71
```

| What | Value |
|---|---|
| Server IP | `159.223.216.71` |
| SSH key | `~/.ssh/keys/elkoskey` |
| User | `root` |
| Domains | `elkos.mk`, `www.elkos.mk` |

---

## Repo layout

```
elkos/
├── index.html              # homepage: copy of mk/index.html (Macedonian, canonical /mk/)
├── mk/index.html           # Macedonian site (static text, lang="mk")
├── en/index.html           # English site (static text, lang="en")
├── business-card.html
├── checkout.html
├── css/  img/              # assets
└── mgmt/                   # operational scripts (run from laptop)
    ├── release.sh          # commit + push + deploy + check (use this)
    ├── push.sh             # older: git add/commit/push
    ├── deploy.sh           # older: rsync repo to server
    ├── ssl-setup.sh        # one-time: install cert auto-renewal
    └── ssl-renew.sh        # manual cert renewal (rarely needed)
```

---

## Common workflows

**Commit, push and release in one step (use this):**
```bash
bash mgmt/release.sh
```
It commits everything, pushes to GitHub, deploys to the live server and checks the live URLs. It stops at the first failure, so nothing is deployed unless it was pushed. The commit message is built from the changed file names. Pass a message only if the user asks for one: `bash mgmt/release.sh "message"`.

When the user says "commit push and release" (or similar), run `bash mgmt/release.sh` with no message.

`mgmt/push.sh` and `mgmt/deploy.sh` are the older separate steps; `release.sh` does both.

**Manual SSL renewal** (auto-renewal already runs; only use if forced):
```bash
bash mgmt/ssl-renew.sh
bash mgmt/ssl-renew.sh --force
```

---

## Server topology

```
                    +---------------------+
internet ----443--->|  elkos-nginx (docker container)
                    |  - serves /usr/share/nginx/html (= /var/www/elkos)
                    |  - reads SSL from /etc/letsencrypt
                    |  - GeoIP redirect: / -> /mk for MK, /en for others
                    +---------------------+
```

| Path on server | Purpose |
|---|---|
| `/var/www/elkos/` | site files (deploy target — `rsync` writes here) |
| `/root/elkos-html-template/nginx.conf` | nginx config (NOT in repo — edit on server) |
| `/etc/letsencrypt/` | Let's Encrypt certs + auto-renewal hooks |
| `/etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh` | stops `elkos-nginx` before renewal |
| `/etc/letsencrypt/renewal-hooks/post/start-nginx.sh` | restarts after renewal |

---

## Language switching

Each language is its own real page, so search engines index both:

1. **`/`** serves the Macedonian page directly (`index.html` is a copy of `mk/index.html`, canonical `/mk/`). There is no redirect and no chooser. English visitors use the EN link in the top bar, which goes to `/en/`.
2. **`/mk/index.html`** and **`/en/index.html`** have the text pre-rendered in HTML, their own title/description/canonical, and `hreflang` alternates. The language switcher is a plain link.

When you change `mk/index.html`, copy it to `index.html` as well.

The two pages are generated from the same content, but there is no build script in the repo. **Edit both files** when changing text, and keep `translations`-style strings in sync. Client-side JS in each page still applies the dictionary, so the in-page strings (such as "Копирано!") stay in that page's language.

---

## SSL auto-renewal

Set up via `mgmt/ssl-setup.sh` (already run once). What it does:

- Enables `certbot.timer` (runs `certbot renew` twice daily).
- Renewal only triggers when cert is within 30 days of expiry.
- Pre-hook stops `elkos-nginx` so certbot can bind port 80 (standalone mode).
- Post-hook restarts `elkos-nginx`.

**Verify it's working:**
```bash
ssh -i ~/.ssh/keys/elkoskey root@159.223.216.71 "systemctl list-timers certbot.timer && certbot renew --dry-run"
```

---

## Troubleshooting

**Site is down (`https://elkos.mk` unreachable):**
```bash
ssh -i ~/.ssh/keys/elkoskey root@159.223.216.71 "docker ps -a | grep elkos-nginx; docker logs --tail 30 elkos-nginx"
```
Common cause: nginx config references a deleted SSL cert and refuses to start.

**Need to edit nginx config:** it lives on the server at `/root/elkos-html-template/nginx.conf`. Always back up before editing:
```bash
cp /root/elkos-html-template/nginx.conf /root/elkos-html-template/nginx.conf.bak.$(date +%F_%H%M)
```
Then `docker restart elkos-nginx` to apply.
