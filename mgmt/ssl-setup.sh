#!/usr/bin/env bash
# One-time setup: installs certbot renewal hooks and enables the timer on the server.
# After running this once, certs auto-renew when they're within 30 days of expiry —
# no more manual `certbot certonly` every 3 months.
#
# Usage:  bash mgmt/ssl-setup.sh

set -euo pipefail

SSH_KEY="$HOME/.ssh/keys/elkoskey"
SSH_HOST="root@159.223.216.71"
CONTAINER="elkos-nginx"

ssh -i "$SSH_KEY" "$SSH_HOST" bash -s <<EOF
set -euo pipefail

mkdir -p /etc/letsencrypt/renewal-hooks/pre /etc/letsencrypt/renewal-hooks/post

cat > /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh <<'HOOK'
#!/bin/bash
docker stop $CONTAINER
HOOK

cat > /etc/letsencrypt/renewal-hooks/post/start-nginx.sh <<'HOOK'
#!/bin/bash
docker start $CONTAINER
HOOK

chmod +x /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh
chmod +x /etc/letsencrypt/renewal-hooks/post/start-nginx.sh

systemctl enable --now certbot.timer
systemctl status certbot.timer --no-pager | head -5

echo "--- Dry-run renewal (no cert is actually issued) ---"
certbot renew --dry-run
EOF

echo
echo "Done. Auto-renewal is active. Check status anytime with:"
echo "  ssh -i $SSH_KEY $SSH_HOST 'systemctl list-timers | grep certbot'"
