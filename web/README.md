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

## Match calendar and team history

The weekly NFL calendar highlights fixtures involving either selected team. “Compare teams” selects that matchup's away and home teams. Each team selector has its next scheduled match and three recent completed results underneath, with earlier results expandable.

Schedule source: https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv

The server refreshes its schedule cache every 15 minutes. If the feed fails, the timestamped bundled `web/schedule.json` is used. Kickoff times are converted from nflverse's Eastern Time to Mountain Time, handling daylight-saving changes. A blank score means no recorded final result; zero is a valid score. Matches awaiting a result are not shown as completed. Bye weeks are skipped when selecting the next game. This is a regular-season schedule, not live scoring.

Past-match rows include total points scored by both teams. “Avg match total” below each team's history is the combined total divided by all completed regular-season games for that team, including earlier matches hidden in the expandable list. Games without a final score are excluded; a 0–0 result counts as zero.

## Quarter-by-quarter performance

Below the head-to-head averages, compare Q1–Q4 and overtime for a supported stat. The average view uses the selected season/last-five window and divides every quarter by covered appearances, including zero-stat quarters. Single-game view lets each player select a recorded game. Missing play-by-play coverage is excluded and displayed explicitly. Fantasy points are not calculated by quarter.

Quarter data is a timestamped snapshot derived from nflverse play-by-play, separate from the automatically refreshed weekly stats. Update it after updating `web/schedule.json` with completed game results:

```sh
# Download the 2026 play-by-play CSV gzip from nflverse's pbp release.
python scripts/update-quarters.py /path/to/play_by_play_2026.csv.gz
node scripts/build.mjs
node scripts/test.mjs
```

Source: https://github.com/nflverse/nflverse-data/releases/tag/pbp

The processor excludes no-play penalties and two-point attempts, credits receiving/rushing touchdowns to the scorer, preserves negative yards, credits lateral yards, and groups any overtime periods separately. Quarter totals are checked against the bundled official weekly stats; later official corrections may differ from an older play-by-play snapshot.

## Season selection

The header's Season menu supports 2020–2026 and remembers the selected year in the browser. Stats, team player lists, calendar, results, quarter comparisons, and CSV exports follow that year. Team/player choices are saved separately per season. Historical seasons use “Full season”; 2026 uses “Season to date.” Current-week highlighting applies only when the selected season's schedule contains today's date.

The stats and schedule APIs accept `?season=YYYY` and reject unsupported years. Prior seasons are cached for 24 hours; current-season cache periods remain one hour for stats and 15 minutes for schedules. `web/history/` contains dated historical schedule and quarter snapshots; historical weekly stats are fetched from nflverse. A failed historical stats request shows an error instead of substituting current-season data.

Rebuild a historical quarter snapshot with `python scripts/update-quarters.py /path/to/play_by_play_2025.csv.gz 2025` after updating that year's historical schedule file. Quarter snapshots can differ from later official corrections, as noted in the UI.

## Go deeper: weekly results and below-average players

The game log shows the selected player's team result and score for each recorded week, using that game's team even if the player was later traded. Missing schedule data displays a dash; games without a final score display Pending; tied games display Tie.

Each week's collapsed “Below-average players” section lists that team's recorded QB/RB/WR/TE appearances below each player's average for the selected stat and average window. Last-five baselines use each player's most recent five recorded appearances in the selected season; season baselines use all appearances, including the inspected game and games before a trade. Players without a recorded appearance that week and equal-to-average results are excluded. This is a numeric stat comparison; lower interception counts are also below average.
