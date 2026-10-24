"""Build a compact, timestamped quarter snapshot from nflverse play-by-play.
Usage: python scripts/update-quarters.py /path/to/play_by_play_2026.csv.gz
Download: https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2026.csv.gz
"""
import csv,gzip,json,sys,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
METRICS=['passing_yards','passing_tds','interceptions','rushing_yards','rushing_tds','carries','receiving_yards','receiving_tds','receptions','targets']
def number(value):
 try:return float(value or 0)
 except ValueError:return 0

def aggregate(rows,final_ids):
 games={};covered=set()
 def add(player,game,week,q,metric,value):
  if not player or not value:return
  key=player+'|'+str(week)
  entry=games.setdefault(key,{'gameId':game,'quarters':{}})
  bucket=entry['quarters'].setdefault(str(q),{})
  bucket[metric]=bucket.get(metric,0)+value
 for r in rows:
  game=r.get('game_id','')
  if game not in final_ids or r.get('season_type')!='REG':continue
  covered.add(game)
  if r.get('play_type')=='no_play' or number(r.get('two_point_attempt')):continue
  q=int(number(r.get('qtr')))
  if q<1:continue
  q=min(q,5);week=int(number(r.get('week')))
  passer=r.get('passer_player_id');rusher=r.get('rusher_player_id');receiver=r.get('receiver_player_id')
  for metric,field in [('passing_yards','passing_yards'),('passing_tds','pass_touchdown'),('interceptions','interception')]:add(passer,game,week,q,metric,number(r.get(field)))
  for metric,field in [('rushing_yards','rushing_yards'),('carries','rush_attempt')]:add(rusher,game,week,q,metric,number(r.get(field)))
  add(receiver,game,week,q,'receiving_yards',number(r.get('receiving_yards')))
  add(receiver,game,week,q,'receptions',number(r.get('complete_pass')))
  if r.get('receiver_player_id'):add(receiver,game,week,q,'targets',number(r.get('pass_attempt')))
  scorer=r.get('td_player_id')
  if number(r.get('pass_touchdown')):add(scorer or receiver,game,week,q,'receiving_tds',1)
  if number(r.get('rush_touchdown')):add(scorer or rusher,game,week,q,'rushing_tds',1)
  add(r.get('lateral_receiver_player_id'),game,week,q,'receiving_yards',number(r.get('lateral_receiving_yards')))
  add(r.get('lateral_rusher_player_id'),game,week,q,'rushing_yards',number(r.get('lateral_rushing_yards')))
 return games,sorted(covered)

if __name__=='__main__':
 schedule=json.loads((ROOT/'web/schedule.json').read_text())
 final_ids={g['id'] for g in schedule['games'] if g['homeScore'] is not None and g['awayScore'] is not None}
 with gzip.open(sys.argv[1],'rt',newline='') as f:games,covered=aggregate(csv.DictReader(f),final_ids)
 output={'season':2026,'fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'nflverse play-by-play snapshot','metrics':METRICS,'coveredGames':covered,'players':games}
 (ROOT/'web/quarters.json').write_text(json.dumps(output,separators=(',',':')))
 print(f'Quarter snapshot: {len(covered)} completed games, {len(games)} player-game entries')
