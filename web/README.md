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

The individual Player game log is now inside “A closer look,” beneath the quarter comparison, with separate player and stat selectors. “Go deeper” is a team weekly review: choose Team A or Team B, then All stats or one specific stat. It includes every completed team game rather than only one player's appearances. Expanded details group below-average stats across all recorded QB/RB/WR/TE players, independent of the head-to-head position selection.

## Key game factors

Each team weekly review now highlights its largest available modeled play swing. Expand “Key game factors” for team context, plays that helped/hurt, late-game markers, and offensive leaders. Below-average players remain in a separate collapsed Supporting stats section.

Team context includes turnover margin, third-down conversions, red-zone offensive TDs/trips, missed field goals/extra points, touchdowns, and explosive passes (20+ yards) and runs (10+ yards). These are derived play-by-play summaries, not a causal explanation of the result. Nullified plays and two-point attempts do not inflate those counts. Red-zone trips are drives with an offensive snap or field-goal attempt at the opponent's 20 or closer; a trip without a TD can still produce points or involve clock management.

Play impact uses `home_wp_post - home_wp` from nflverse when available, otherwise offense-oriented `wpa` adjusted to the home team. The UI flips that impact for an away-team review and shows percentage points, with no individual blame claim. The snapshot retains the three largest helpful/harmful swings and up to two largest late swings, skips kneel-downs and changes smaller than 0.1 percentage point, and identifies Q4/OT plays. Valid modeled penalty swings can appear even though nullified player-stat events do not count in team totals. Offensive leaders show the selected team's passing/rushing/receiving yard leaders regardless of game outcome.

Factors are dated snapshots, independent of automatically refreshed stats/schedules. Generate them using:

```sh
python scripts/update-factors.py /path/to/play_by_play_2026.csv.gz 2026
python scripts/test-factors.py
node scripts/build.mjs
node scripts/test.mjs
```

Historical factor snapshots are included for 2020–2025 and follow the selected season. A newly completed game not covered by the snapshot shows an explicit missing-data message.

## Compact phone navigation

At widths up to 760px, the dashboard becomes a focused mobile interface with bottom navigation for Matches, Teams and Players. Players has Averages, Quarters, Game log and Weekly chart views. Teams separates Game review from Team summary. The introductory banner and duplicate player cards are hidden on phones; only the selected view is displayed.

The compact sticky comparison bar opens a native dialog through Change. Existing team/player/window controls and Refresh/Export buttons are moved into the dialog and restored when closed, preserving handlers and selection synchronization. Calendar fixtures are full-row tap targets; choosing one switches to Players → Averages. The browser remembers the mobile route separately from desktop performance-section states. Switching back above 760px restores the desktop dashboard and control placement.

Mobile interactions were exercised against the full application DOM, including selection, panel close, matchup navigation and breakpoint changes. A physical iPhone/Safari visual pass is still required when that environment is available.

## Multiple positions on phones

The Players Change panel now supports any nonempty selection of QB, RB, WR and TE. Each enabled position has independent Team A and Team B player selectors. Defaults use the leading season producer: QB passing yards, RB rushing plus receiving yards, and WR/TE receiving yards. Touchdowns break yardage ties; QB interception totals and appearances are further tie-breakers. Manual player choices are preserved. Choices are saved per season and team pair and revalidated against the selected rosters whenever data or teams change.

Averages, Quarters and Weekly chart display one comparison block per enabled position. Quarter and chart stats can be selected independently for each block. Quarters supports both average and single-game views, separate game selectors for each player, overtime and total. The fourth player tab is Game log, where any selected player and an appropriate stat can be chosen. The shared average window applies to all blocks.

Matches and Teams no longer show the player Change bar. Selecting a calendar fixture opens the Teams game review. Selected team names in weekly matchups are highlighted in the Team A/Team B palette, with the existing purple fixture highlight retained for head-to-head games. Desktop retains its single-position dashboard controls.

## Match-first selection and franchise palettes

New sessions start on Matches with no teams selected. Team selectors include an explicit Choose a team option; only manual choices and selected fixtures are remembered using the revised selection preference keys. Tapping a fixture opens Teams → Team summary. The Summary tab is left of Game review, and the review selector displays only the team names.

Every calendar team-name badge uses a franchise palette regardless of selection. Team summary panels, selectors and accents use the same palette, replacing side-based green/orange/purple calendar colors. Palette source: https://github.com/nflverse/nflverse-data/releases/download/teams/teams_colors_logos.csv . Broncos orange (`#FB4F14`) and Saints brown (`#8B6F47`) are user-requested accents. Badge text switches between white and near-black for contrast; empty selections use a neutral palette.


Team badges now use both primary and secondary franchise colors and official logo/emblem URLs from nflverse's team metadata (ESPN-hosted images). If an image fails, the team abbreviation is shown. Player names/cards, average bars, quarter cards and weekly chart series use those palettes too. When both teams share a primary color, the second team's secondary color distinguishes the chart series. Updated mobile selection preferences track manual overrides separately from automatic defaults, so subsequent data refreshes can update automatic leaders without replacing manual choices.

Player-name blocks in mobile averages, quarters, weekly charts and the selected game log now use prominent identity cards: uppercase display names, side/position labels, selected-window appearance counts, a low-opacity team abbreviation watermark, and primary/secondary franchise accents. The second side uses a lighter team tint for contrast, following the desktop reference layout.

The Game review selector updates the whole review's franchise theme, including weekly cards, expandable headers, factor metrics, offensive leaders and supporting tables. Win/loss and helpful/harmful colors remain semantic indicators.

## Selected-game review and prediction

Calendar selection now retains the exact fixture ID per season. Teams → Summary remains the first view. A selected completed fixture exposes Game review and hides Game predict; a fixture without a final result exposes Game predict and hides Game review. Manual team changes clear the selected fixture rather than showing an unrelated game's details.

Game review is restricted to the selected completed game. It includes Q1–Q4/OT team scores, per-quarter turnovers/third downs/touchdowns/missed field goals/explosive plays, and up to two retained modeled key plays per period, followed by the full-game factor review and supporting stats for the selected team. Quarter scoring is reconstructed from post-play cumulative scores and shown only when it reconciles with the schedule's final score. Factor snapshots for all supported seasons include this period data. A completed-game Summary displays the actual final total instead of a prediction.

Game predict uses only completed selected-season games dated strictly before the fixture, never later season results. It shows each team's expected points and the combined scoring baseline, prior scoring/points-allowed averages and sample counts, the last three eligible results, and shared-opponent scoring context. The baseline is the same scored/allowed averaging formula; recent/shared-opponent information is context and does not add untested model adjustments. It is not a calibrated probability forecast and does not account for injuries/weather. Quarter snapshots and model-derived events retain their dated-data limitations.
