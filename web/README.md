# NFL Stat Lab: team and player comparisons

Choose Team A and Team B at the top, then select a player from each team at the chosen position. Compare 2026 season-to-date or last-five-appearance averages, weekly charts and game logs. Swap both teams and players or export the comparison as CSV. Selections are saved in your browser.

## Data

Source: https://github.com/nflverse/nflverse-data/releases/tag/stats_player

The Worker fetches `stats_player_week_2026.csv` from that release, caching it for one hour. If the source is unavailable, it serves the timestamped bundled snapshot and labels it as saved data. Refresh stats checks the server's cached feed; this is not a live play-by-play feed.

Team lists use each player's latest recorded team, not a live roster. Only players with recorded regular-season stats appear. Season averages include all recorded appearances, including games before a trade and partial games. Zero-stat appearances count; missing and bye weeks are excluded. Last five means the player's last five recorded appearances.

## Build and test

From the repository root:

```sh
node scripts/build.mjs
node scripts/test.mjs
```

The build embeds the web assets into `dist/server/index.js`, a self-contained Cloudflare Worker. Server source is `worker/index.js`; hosting configuration is `.openai/hosting.json`. Generated `dist/` is not committed. No API key or odds-provider account is required.

For a static preview using the bundled snapshot:

```sh
python3 -m http.server 8080 --directory web
```

Private site: https://nfl-stat-lab-4826.satinyspice13.chatgpt.site
