#!/usr/bin/env bash
# Manual SSL renewal. You normally don't need this — the systemd timer
# installed by ssl-setup.sh handles renewals automatically.
# Use this only to force a renewal or troubleshoot.
#
# Usage:  bash mgmt/ssl-renew.sh         # renew if within 30 days of expiry
#         bash mgmt/ssl-renew.sh --force # force renew regardless of expiry

set -euo pipefail

SSH_KEY="$HOME/.ssh/keys/elkoskey"
SSH_HOST="root@159.223.216.71"

FORCE_FLAG=""
if [[ "${1:-}" == "--force" ]]; then
  FORCE_FLAG="--force-renewal"
fi

ssh -i "$SSH_KEY" "$SSH_HOST" "certbot renew $FORCE_FLAG"
