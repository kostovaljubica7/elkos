

# scp -r -i ~/.ssh/keys/elkoskey ~/Documents/elkos root@159.223.216.71:/var/www/
rsync -av \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='.vscode' \
  --exclude='mgmt' \
  --exclude='CLAUDE.md' \
  -e "ssh -i ~/.ssh/keys/elkoskey" \
  ~/Documents/elkos/ \
  root@159.223.216.71:/var/www/elkos/