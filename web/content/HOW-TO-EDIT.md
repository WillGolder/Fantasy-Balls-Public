# How to update Fantasy Balls (no coding)

Edit files in this `content` folder or drop photos/videos in `public`.
Then push to GitHub. Vercel updates the live site in a minute.

## Quotes (text)
Open `quotes.json`. Copy a line:

```
{ "text": "The quote", "by": "Name" }
```

## Quotes (video)
1. Put the file in `web/public/quotes/` (example: `dunk.mp4`)
2. Add:

```
{ "text": "John sucks.", "by": "League", "video": "/quotes/dunk.mp4" }
```

## Quotes (image)
Same idea: file in `web/public/quotes/photo.jpg` and `"image": "/quotes/photo.jpg"`

## Dues / draft
`league.json` — change `"paid": ["Will Golder", "Brendan Reed"]` and the draft date.

## Bios
`bios.json`

## Rules
`rules.md`

## Timeline
`timeline.json`

## Rivalry names later
`rivalry-names.json` like `"Eddie Cramsie|Chumba": "The Rubber Match"`

## Manager photos
`web/public/managers/will-golder.jpg` (same filename to replace)

## After you change files
```
cd C:\Users\WillG\Downloads\fantasy-balls-v25\fantasy-balls
git add web
git commit -m "Update site"
git push
```
