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
├── index.html              # main site (with client-side language switching)
├── business-card.html
├── checkout.html
├── shop.html               # currently a redirect; _shop.html is WIP
├── css/  img/              # assets
└── mgmt/                   # operational scripts (run from laptop)
    ├── push.sh             # git add/commit/push
    ├── deploy.sh           # rsync repo to server
    ├── ssl-setup.sh        # one-time: install cert auto-renewal
    └── ssl-renew.sh        # manual cert renewal (rarely needed)
```

---

## Common workflows

**Push code to GitHub:**
```bash
bash mgmt/push.sh
```

**Deploy to server** (rsync to `/var/www/elkos/`):
```bash
bash mgmt/deploy.sh
```

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

Two layers:

1. **Nginx GeoIP redirect** at root: Macedonia visitors go to `/mk`, everyone else to `/en`.
2. **Client-side JS** in `index.html` reads `/mk` or `/en` from the URL and applies the matching language. Falls back to `localStorage` then to IP detection if URL has no prefix.

If you change language behavior, both layers may need updating.

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
