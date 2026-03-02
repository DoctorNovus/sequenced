# Docker Nginx Cutover

## What This Does

- Runs Nginx in Docker on `:80` and `:443`
- Proxies:
  - `dashboard.tidaltask.app` -> `frontend:80`
  - `api.tidaltask.app` -> `api:8080`
  - `sequenced.ottegi.com` -> redirects to `dashboard.tidaltask.app`
  - `api.sequenced.ottegi.com` -> redirects to `api.tidaltask.app`
- Serves ACME challenge files from `/var/www/letsencrypt`
- Uses existing certs from `/etc/letsencrypt/live/sequenced.ottegi.com/`

## One-Time Server Prep

```bash
sudo mkdir -p /var/www/letsencrypt
```

## Cutover Steps

```bash
cd /root/sequenced
git pull --rebase origin main

# Stop host nginx so Docker can bind 80/443
sudo systemctl stop nginx
sudo systemctl disable nginx

# Start/recreate stack with Docker nginx
docker compose up -d --build --remove-orphans

# Expand the existing cert to include new domains
sudo certbot certonly --webroot \
  -w /var/www/letsencrypt \
  --cert-name sequenced.ottegi.com \
  -d sequenced.ottegi.com \
  -d api.sequenced.ottegi.com \
  -d dashboard.tidaltask.app \
  -d api.tidaltask.app

# Reload nginx in Docker after cert update
docker compose exec -T nginx nginx -s reload

# Verify
docker compose ps
curl -I http://dashboard.tidaltask.app
curl -I https://dashboard.tidaltask.app
curl -I https://api.tidaltask.app
curl -I https://sequenced.ottegi.com
curl -I https://api.sequenced.ottegi.com
```

## Certbot Renewal Hook (Recommended)

Create a deploy hook so renewed certs are reloaded in Docker nginx:

```bash
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat <<'EOF' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-docker-nginx.sh >/dev/null
#!/usr/bin/env bash
set -euo pipefail
cd /root/sequenced
docker compose exec -T nginx nginx -s reload
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-docker-nginx.sh
```

Test renewal flow:

```bash
sudo certbot renew --dry-run
```

## Rollback

```bash
cd /root/sequenced
docker compose stop nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```
