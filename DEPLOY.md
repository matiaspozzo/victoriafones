# Deploy to DigitalOcean (cheapest setup — client demo)

**Target cost: ~US$6/month, $0 extra.** Everything (Laravel/Filament + Next.js) runs on a
single small Droplet. No managed database, no Spaces bucket, no load balancer, no
custom domain purchase required.

How this keeps the bill down:

| Normally costs extra | What we do instead |
|---|---|
| Managed Postgres/MySQL (~$15/mo) | Keep **SQLite** (already the local `.env` default) — plenty for a demo |
| Spaces/S3 bucket for media (~$5/mo) | Store property images on the droplet's **local disk** |
| A second droplet or App Platform service for the frontend | Run **Next.js via PM2** on the same box, reverse-proxied by Nginx |
| A purchased domain (~$12/yr) for HTTPS | Use a **free [sslip.io](https://sslip.io) hostname** — real DNS, works with Let's Encrypt |
| A background queue worker process | Set `QUEUE_CONNECTION=sync` — the only jobs are the revalidate call + lead emails, both cheap |

If the client wants to keep this beyond the demo, the easy upgrades later are (in order of
priority): a real domain, DO Spaces for media, automated Droplet backups, and bumping the
Droplet size — none of them require re-architecting anything below.

---

## 0. Prerequisites

- A DigitalOcean account + an SSH key added to it (Settings → Security).
- This repo pushed to a Git host DO's droplet can reach (GitHub is easiest).

---

## 1. Create the Droplet

1. **Create → Droplets**.
2. Image: **Ubuntu 24.04 (LTS) x64**.
3. Plan: **Basic → Regular SSD → $6/mo (1 GB RAM / 1 vCPU / 25 GB SSD)**.
   - 1 GB is tight for `npm run build` — step 4 adds a swapfile so it doesn't OOM.
   - If the demo needs to feel snappier, the $12/mo (2 GB) tier is a one-click resize
     later; don't over-provision up front.
4. Region: closest to the client.
5. Authentication: **SSH key** (not password).
6. Hostname: anything, e.g. `victoriafones-demo`.
7. Create, then note the Droplet's public IP — call it `IP` below.

---

## 2. Get free HTTPS hostnames (no domain purchase)

[sslip.io](https://sslip.io) resolves `anything.<IP-with-dots-replaced-by-dashes>.sslip.io`
straight to `<IP>` — it's real public DNS, so Let's Encrypt will issue certificates for it
normally. Two hostnames, mirroring the local dev split:

- Frontend: `app.IP-WITH-DASHES.sslip.io`
- Backend/API/admin: `api.IP-WITH-DASHES.sslip.io`

Example: if the Droplet IP is `203.0.113.10`, use `app.203-0-113-10.sslip.io` and
`api.203-0-113-10.sslip.io`. Nothing to configure — just use these strings in the steps
below. (If the client already owns a domain, use real subdomains instead — same steps,
just point A records at `IP` first.)

---

## 3. Initial server setup

SSH in as root, then:

```bash
ssh root@IP

adduser deploy
usermod -aG sudo deploy

# Let `deploy` log in with the same SSH key as root — needed later to rsync
# the local database/media straight to the server as `deploy`.
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Basic firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Swap — prevents `npm run build` from getting OOM-killed on a 1GB droplet
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

su - deploy
```

Do the rest of these steps as `deploy` (using `sudo` where needed), not root.

---

## 4. Install the stack

```bash
sudo apt update && sudo apt upgrade -y

# Nginx
sudo apt install -y nginx

# PHP 8.2 — Ubuntu 24.04's default repos only carry PHP 8.3, so add the
# Ondřej Surý PPA to get 8.2 specifically (matches the version pinned locally).
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update

# PHP 8.2 + the extensions Laravel/Filament/Spatie Media Library need
sudo apt install -y php8.2-fpm php8.2-cli php8.2-sqlite3 php8.2-mbstring \
  php8.2-xml php8.2-curl php8.2-gd php8.2-zip php8.2-bcmath php8.2-intl

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (keeps Next.js running, restarts on crash/reboot)
sudo npm install -g pm2

# Certbot for free SSL
sudo apt install -y certbot python3-certbot-nginx

sudo apt install -y git
```

---

## 5. Get the code

```bash
sudo mkdir -p /var/www/victoriafones
sudo chown deploy:deploy /var/www/victoriafones
git clone <YOUR_REPO_URL> /var/www/victoriafones
cd /var/www/victoriafones
```

---

## 6. Backend (Laravel + Filament)

```bash
cd /var/www/victoriafones/backend
composer install --no-dev --optimize-autoloader

cp .env.example .env   # or create fresh if no .env.example
```

Edit `.env` (`nano .env`) — set these (fill in your two sslip.io hostnames):

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.IP-WITH-DASHES.sslip.io
FRONTEND_URL=https://app.IP-WITH-DASHES.sslip.io

DB_CONNECTION=sqlite
# (remove/comment DB_HOST, DB_DATABASE etc. — not used with sqlite)

FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

REVALIDATE_SECRET=<generate one: `openssl rand -hex 32`>
```

```bash
php artisan key:generate
```

### Bring your local data over as the starting point

The client demo should start from what's already in your **local** database (all the
imported/translated properties, neighborhoods, amenities) — not a fresh `--seed` run,
which would only create the handful of seeder rows and none of the real property data.
The SQLite file and the property images are both gitignored (never went through git),
so copy them straight from your machine to the server instead.

Run this **from your local machine**, from the repo root (not on the server):

```bash
rsync -avz backend/database/database.sqlite deploy@IP:/var/www/victoriafones/backend/database/database.sqlite
rsync -avz backend/storage/app/public/ deploy@IP:/var/www/victoriafones/backend/storage/app/public/
```

Back on the server:

```bash
cd /var/www/victoriafones/backend

# Only applies schema migrations the transferred DB doesn't have yet — no --seed,
# the real data (and the seeders' rows) is already inside database.sqlite.
php artisan migrate --force

php artisan storage:link

# Perf caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan filament:optimize

# Permissions
sudo chown -R deploy:www-data storage bootstrap/cache database/database.sqlite
sudo chmod -R 775 storage bootstrap/cache
```

> **Security:** the transferred database brings your local admin user along with it —
> `admin@victoriafones.com` / `password` (the `UserFactory` default). Change that
> password before showing this to the client:
> ```bash
> php artisan tinker
> >>> $u = \App\Models\User::where('email', 'admin@victoriafones.com')->first();
> >>> $u->password = \Illuminate\Support\Facades\Hash::make('a-real-password-here');
> >>> $u->save();
> ```
> (Or use `php artisan make:filament-user` to add a second admin instead, and delete
> the old one.)

---

## 7. Frontend (Next.js)

```bash
cd /var/www/victoriafones/frontend
```

Create `.env.production`:

```
NEXT_PUBLIC_API_URL=https://api.IP-WITH-DASHES.sslip.io
NEXT_PUBLIC_SITE_URL=https://app.IP-WITH-DASHES.sslip.io
REVALIDATE_SECRET=<same value as backend's REVALIDATE_SECRET>
```

```bash
npm install
npm run build

pm2 start npm --name vf-frontend -- start -- -p 3001
pm2 save
pm2 startup   # run the sudo command it prints, once, to survive reboots
```

---

## 8. Nginx: backend (`api.…`)

```bash
sudo nano /etc/nginx/sites-available/vf-api
```

```nginx
server {
    listen 80;
    server_name api.IP-WITH-DASHES.sslip.io;
    root /var/www/victoriafones/backend/public;

    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    client_max_body_size 20m;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vf-api /etc/nginx/sites-enabled/
```

---

## 9. Nginx: frontend (`app.…`)

```bash
sudo nano /etc/nginx/sites-available/vf-app
```

```nginx
server {
    listen 80;
    server_name app.IP-WITH-DASHES.sslip.io;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vf-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. Free SSL

```bash
sudo certbot --nginx -d api.IP-WITH-DASHES.sslip.io -d app.IP-WITH-DASHES.sslip.io
```

Certbot edits both server blocks to redirect HTTP → HTTPS and auto-renews via a systemd
timer it installs — nothing else to do.

---

## 11. Verify

- `https://app.IP-WITH-DASHES.sslip.io` → the public site.
- `https://api.IP-WITH-DASHES.sslip.io/admin` → Filament login (`admin@victoriafones.com`
  + the password you just set).
- In Filament, edit a property and save — confirm it doesn't error (that's the
  Observer calling the frontend's `/api/revalidate` with `REVALIDATE_SECRET`; if the
  two values don't match on both `.env`s, saves will still succeed but the public page
  won't update until the ISR window expires).

---

## Redeploying after changes

```bash
cd /var/www/victoriafones && git pull

cd backend && composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache

cd ../frontend && npm install && npm run build
pm2 restart vf-frontend
```

---

## Known limits of this setup (fine for a demo, not for production)

- **SQLite + local disk media are not backed up.** If you need a safety net for
  cheap, turn on DO's Droplet backups (Droplet → Backups, ~20% of the droplet cost/mo
  → ~$1.20/mo on the $6 plan) rather than migrating to managed Postgres/Spaces.
- **Single droplet = single point of failure**, no auto-scaling. Fine for a
  low-traffic client demo.
- **`MAIL_MAILER=log`** — lead form emails aren't actually sent, they just log. Point
  it at a real SMTP (or a free-tier provider like Resend/Mailgun) if the client needs
  to receive lead notifications during the demo.
