# Turbo Tables

Jeu de calcul mental pour réviser les tables de multiplication (enfant de 8 ans, téléphone ou tablette).

```bash
pnpm install
cp .env.example .env.local   # puis remplir FAMILY_CODE
pnpm dev                     # http://localhost:3000
pnpm test                    # règles du jeu (Vitest)
```

Déploiement : Coolify, build pack **Dockerfile**, port 3000, volume persistant sur `/app/data`, variable `FAMILY_CODE`.

Tout le reste (règles, données, plan du compagnon) est dans [CLAUDE.md](CLAUDE.md).
