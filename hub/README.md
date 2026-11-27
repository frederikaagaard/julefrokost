# Game of Fate — shared entrance

Separate Vercel project, with a side-by-side split entrance and isolated snapshots of Butterfly and Temptation under `/butterfly/` and `/temptation/`. Each snapshot has a menu linking back to `/`.

Original deployments are unchanged. Menu integration changes only snapshot HTML and adds a pause event listener to the runner snapshot. Its engine is identical to the original. Assets are immutable GitHub-backed files from the same snapshot commit.
