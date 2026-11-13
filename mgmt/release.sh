#!/usr/bin/env bash
# One command to commit, push and release (deploy) the site.
#
# Usage:
#   bash mgmt/release.sh                       (message built from changed file names)
#   bash mgmt/release.sh "what changed"        (optional custom message)
#
# Steps (stops at the first failure, so nothing is deployed unless it was pushed):
#   1. git add -A + commit with the message (skipped if nothing changed)
#   2. git push to GitHub (main)
#   3. rsync the site to the live server (/var/www/elkos)
#   4. check that the live homepage and sitemap respond

set -euo pipefail
cd "$(dirname "$0")/.."

MSG="${1:-}"
if [ -z "$MSG" ] && [ -n "$(git status --porcelain)" ]; then
  # No message given: name the changed files instead
  FILES=$(git status --porcelain | awk '{print $NF}' | head -4 | paste -sd, -)
  MSG="Update $FILES"
fi

SSH_KEY="$HOME/.ssh/keys/kostovaljubica"
SERVER="root@159.223.216.71"
SSH_OPTS="-o BatchMode=yes -i $SSH_KEY"

echo "==> 1/4 Commit"
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "$MSG" -m "Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
else
  echo "    No local changes to commit."
fi

echo "==> 2/4 Push to GitHub"
git push

echo "==> 3/4 Release to the live server"
rsync -av \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='.vscode' \
  --exclude='mgmt' \
  --exclude='CLAUDE.md' \
  --exclude='business-card.html' \
  --exclude='checkout.html' \
  --exclude='shop-knipex.html' \
  -e "ssh $SSH_OPTS" \
  ./ "$SERVER:/var/www/elkos/"

echo "==> 4/4 Check live site"
for path in / /mk/ /en/ /robots.txt /sitemap.xml; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://elkos.mk$path")
  echo "    $code  https://elkos.mk$path"
done
echo "Done."
