# NFL Stat Lab website

A static NFL player comparison dashboard. Supports QB, RB, WR, and TE comparisons, full-season and last-five-appearance averages, weekly charts, game logs, CSV export, and browser-local saved selections.

## Run locally

From this repository's root:

```sh
python3 -m http.server 8080 --directory web
```

Open http://localhost:8080. No build or dependencies are required. Serve over HTTP rather than opening index.html directly because player data loads with fetch.

## Data

The bundled snapshot contains 2024 regular-season recorded appearances from nflverse:
https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_2024.csv

It is historical data, not live. Averages divide totals by recorded appearances in the chosen window; missing weeks are excluded. This website uses a separate snapshot from the existing backend/iOS prototype.

Hosted private site: https://nfl-stat-lab-4826.satinyspice13.chatgpt.site
