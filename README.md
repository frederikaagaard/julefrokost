# Game of Fate

Mobilhjemmeside efter det leverede Figma-design. Ingen installation eller backend nødvendig.

## Forløb

- Start → spillervalg.
- Vælg spiller → cirkelgrafik animerer i 2 sekunder → spillerens profil.
- Profilens bundknap og tilbagepil → spillervalg.
- Logo → start.
- Computer viser “Åbn på din mobil”. Mobiloplevelsen vises op til 600 px bredde.

## GitHub og Vercel

Upload indholdet af denne mappe til roden af et nyt GitHub-repository. Importér repository'et i Vercel. Den medfølgende `vercel.json` indstiller build og outputmappe automatisk. Vælg “Other”, hvis Vercel spørger efter framework. Ingen miljøvariabler kræves.

## Lokalt

Kør `npm run dev` og åbn `http://localhost:3000`. Kør `npm test` for at kontrollere indhold og lokale billedfiler.

## Indhold

`dist/data.json` indeholder historier, fakta og billedplaceringer. `dist/assets/` indeholder alle billeder og logoer lokalt. `dist/styles.css` indeholder udseendet. `dist/app.js` indeholder navigation og animation.

Figma-kilden er bevaret som indhold; historiske alternativer er fiktion, og tekstens årstal og formuleringer er ikke redigeret.

## Kontrolleret

Alle otte spillerforløb, tosekunderstimeren, tilbageknapper, logolinks og afbrudt animation er kontrolleret automatisk. Alle anvendte billedfiler er lokale og kan afkodes. Visuel kontrol i en rigtig browser mangler, fordi forhåndsvisningsmiljøet var utilgængeligt.
