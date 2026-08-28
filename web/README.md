# Fantasy Balls

Next.js league archive. Edit content in `content/` and photos in `public/managers/`.

## Local
```bash
cd web
npm install
npm run dev
```

## Go live
1. Put this project on GitHub (upload the `fantasy-balls` folder).
2. Sign in at https://vercel.com with GitHub.
3. Import the repo. Root directory: `web`.
4. Deploy. You get a `*.vercel.app` URL.
5. Later: buy a domain and add it in Vercel → Settings → Domains.

## Edit after launch
Change files on GitHub (pencil icon) or send updates to be patched:
- `web/content/league.json` — dues + draft
- `web/content/quotes.json`
- `web/content/bios.json`
- `web/content/rules.md`
- `web/content/timeline.json`
- `web/content/rivalry-names.json`
- `web/public/managers/{slug}.jpg`

Vercel rebuilds automatically.

## ESPN refresh
Set GitHub secrets `ESPN_S2` and `SWID`. The weekly workflow updates current-season JSON. If cookies expire, old files stay.
