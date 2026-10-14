# FiveCents

FiveCents is an Academic Year contribution journal for the School of Infocomm. It supports shared contributions, individual cents valuation, Reporting Officer adjustments, hierarchy-aware access, evidence, and atomic locking.

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the agreed product requirements.

## Run locally

```bash
npm install
npm run dev
```

The current interface uses representative AY2026 data so it can be reviewed without a database. PostgreSQL DDL and reference data are in `database/schema.sql` and `database/seed.sql`.

## PostgreSQL setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `SESSION_SECRET`.
2. Apply `database/schema.sql` to a new PostgreSQL database.
3. Apply `database/seed.sql`.
4. Create the first Overall Administrator through a controlled bootstrap script or database migration before enabling production access.

## Azure target

The Next.js application uses standalone output for Azure App Service. Production also requires Azure Database for PostgreSQL, Azure Blob Storage, an SMTP provider for password reset, and application settings corresponding to `.env.example`.

## Verification

```bash
npm test
npm run build
```
