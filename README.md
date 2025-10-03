# Wedding Site (Next.js + Tailwind) — Fixed

- Admin uses `x-admin-pass` header for GET/PUT.
- No `postinstall` script required.
- Run locally:
  ```
  cp .env.example .env
  npm ci
  npm run dev
  # http://localhost:3000  &  http://localhost:3000/admin
  ```
- Docker:
  ```
  docker compose up -d
  ```
