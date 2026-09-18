# Remáticos - Deployment Guide

## Architecture

```
                  ┌─────────────┐
                  │   Nginx     │
                  │   :80/:443  │
                  └──────┬──────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐
   │  Storefront │ │   Admin    │ │   API    │
   │  :3001      │ │   :3000    │ │   :4000  │
   └─────────────┘ └────────────┘ └────┬─────┘
                                       │
                      ┌────────────────┼────────────┐
                      │                │            │
               ┌──────▼──────┐  ┌──────▼──────┐    │
               │  PostgreSQL │  │    Redis    │    │
               │  :5432      │  │    :6379    │    │
               └─────────────┘  └─────────────┘    │
                                                   │
                                          ┌────────▼────────┐
                                          │  /uploads (vol)  │
                                          └─────────────────┘
```

## Domains

| Service | Domain |
|---------|--------|
| Storefront (public) | https://rematicos.reinbor.cloud |
| Admin (private) | https://rematicosadmin.reinbor.cloud |

## VPS Setup

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Clone the repository

```bash
git clone <your-repo-url> /opt/rematicos
cd /opt/rematicos
```

### 3. Configure environment

```bash
cp .env.production.example .env.production
nano .env.production
```

Generate secure secrets:
```bash
openssl rand -base64 48
```

### 4. SSL Certificates

For initial setup, generate self-signed certs:
```bash
mkdir -p infra/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infra/nginx/ssl/server.key \
  -out infra/nginx/ssl/server.crt \
  -subj "/CN=rematicos.reinbor.cloud"
```

For production, use Let's Encrypt:
```bash
# Install certbot on host
sudo apt install certbot

# Get certificates
sudo certbot certonly --webroot -w /var/www/certbot \
  -d rematicos.reinbor.cloud \
  -d rematicosadmin.reinbor.cloud

# Copy to project
sudo cp /etc/letsencrypt/live/rematicos.reinbor.cloud/fullchain.pem infra/nginx/ssl/server.crt
sudo cp /etc/letsencrypt/live/rematicos.reinbor.cloud/privkey.pem infra/nginx/ssl/server.key
```

### 5. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T api npx prisma db push --schema=prisma/schema.prisma --accept-data-loss
```

### 6. Check status

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

## File Uploads

Uploads are stored in a Docker volume `uploads_data` mounted at `/app/uploads`. The nginx config proxies `/uploads/*` requests to the API, which serves them as static files.

## Database Migrations

After schema changes:
```bash
docker compose -f docker-compose.prod.yml exec -T api npx prisma db push --schema=prisma/schema.prisma
```

## Updating

```bash
git pull origin main
./deploy.sh
```

## Troubleshooting

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs storefront

# Enter a container
docker compose -f docker-compose.prod.yml exec api sh

# Check API health
curl http://localhost:4000/health

# Rebuild a single service
docker compose -f docker-compose.prod.yml up -d --build api
```
