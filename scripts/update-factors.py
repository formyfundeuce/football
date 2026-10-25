"""Derive team game factors from nflverse play-by-play. Usage: python scripts/update-factors.py file.csv.gz [season]."""
import csv,gzip,json,sys,math,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

def num(value,default=None):
 try:
  n=float(value)
  return n if math.isfinite(n) else default
 except (ValueError,TypeError):return default

def fresh():return {'interceptions':0,'fumblesLost':0,'thirdMade':0,'thirdAttempts':0,'redZoneTrips':0,'redZoneTDs':0,'missedFG':0,'missedXP':0,'touchdowns':0,'explosivePasses':0,'explosiveRuns':0}

def category(r,valid):
 if not valid:return 'Penalty' if num(r.get('penalty'),0) else 'Play'
 if num(r.get('interception'),0) or num(r.get('fumble_lost'),0):return 'Turnover'
 if num(r.get('touchdown'),0):return 'Touchdown'
 if r.get('field_goal_result') in ['missed','blocked']:return 'Missed field goal'
 if r.get('extra_point_result') in ['failed','blocked']:return 'Missed extra point'
 if num(r.get('fourth_down_failed'),0):return 'Fourth-down stop'
 if num(r.get('third_down_failed'),0):return 'Third-down stop'
 if (num(r.get('passing_yards'),0)>=20 or num(r.get('rushing_yards'),0)>=10):return 'Explosive play'
 if r.get('field_goal_result')=='made':return 'Field goal'
 return 'Play'

def aggregate_factors(rows,finals):
 games={};drives={}
 for r in rows:
  gid=r.get('game_id')
  if gid not in finals or r.get('season_type')!='REG':continue
  home=r.get('home_team');away=r.get('away_team')
  if not home or not away:continue
  g=games.setdefault(gid,{'home':home,'away':away,'week':int(num(r.get('week'),0)),'teams':{home:fresh(),away:fresh()},'plays':[],'periods':{}})
  period=str(min(5,int(num(r.get('qtr'),0))))
  if period!='0':
   q=g['periods'].setdefault(period,{'teams':{home:fresh(),away:fresh()},'homeCumulative':None,'awayCumulative':None,'plays':[]})
   hs=num(r.get('total_home_score'));aws=num(r.get('total_away_score'))
   if hs is not None:q['homeCumulative']=int(hs)
   if aws is not None:q['awayCumulative']=int(aws)
  previous={team:dict(values) for team,values in g['teams'].items()}
  post=r.get('posteam');valid=r.get('play_type')!='no_play';two=bool(num(r.get('two_point_attempt'),0))
  if valid and not two and post in g['teams']:
   team=g['teams'][post]
   team['interceptions']+=int(num(r.get('interception'),0))
   if num(r.get('fumble_lost'),0):
    credited=False
    for i in [1,2]:
     fumbled=r.get(f'fumbled_{i}_team');recovered=r.get(f'fumble_recovery_{i}_team')
     if fumbled in g['teams'] and recovered in g['teams'] and fumbled!=recovered:
      g['teams'][fumbled]['fumblesLost']+=1;credited=True
    if not credited:g['teams'][r.get('fumbled_1_team') if r.get('fumbled_1_team') in g['teams'] else post]['fumblesLost']+=1
   made=int(num(r.get('third_down_converted'),0));failed=int(num(r.get('third_down_failed'),0))
   team['thirdMade']+=made;team['thirdAttempts']+=made+failed
   team['missedFG']+=int(r.get('field_goal_result') in ['missed','blocked'])
   team['missedXP']+=int(r.get('extra_point_result') in ['failed','blocked'])
   team['explosivePasses']+=int(num(r.get('passing_yards'),0)>=20)
   team['explosiveRuns']+=int(num(r.get('rushing_yards'),0)>=10)
   if num(r.get('touchdown'),0):
    scorer=r.get('td_team') or (post if num(r.get('pass_touchdown'),0) or num(r.get('rush_touchdown'),0) else r.get('defteam'))
    if scorer in g['teams']:g['teams'][scorer]['touchdowns']+=1
   drive=r.get('fixed_drive') or r.get('drive')
   if drive and r.get('play_type') in ['pass','run','field_goal']:
    d=drives.setdefault((gid,drive,post),{'inside':False,'td':False})
    yard=num(r.get('yardline_100'));d['inside']=d['inside'] or (yard is not None and yard<=20)
    d['td']=d['td'] or bool(num(r.get('pass_touchdown'),0) or num(r.get('rush_touchdown'),0))
  if period!='0':
   for code in [home,away]:
    for metric,value in g['teams'][code].items():q['teams'][code][metric]+=value-previous[code][metric]
  before=num(r.get('home_wp'));after=num(r.get('home_wp_post'));wpa=num(r.get('wpa'))
  impact=after-before if before is not None and after is not None else (wpa*(1 if post==home else -1) if wpa is not None and post in [home,away] else None)
  play_type=r.get('play_type');desc=r.get('desc','').strip();quarter=int(num(r.get('qtr'),0))
  if impact is None or abs(impact)<.001 or abs(impact)>1 or not desc or quarter<1 or num(r.get('qb_kneel'),0) or play_type not in ['pass','run','punt','kickoff','field_goal','extra_point','no_play']:continue
  g['plays'].append({'id':r.get('play_id'),'quarter':quarter,'clock':r.get('time') or '','description':desc,'homeImpact':round(impact,6),'kind':category(r,valid),'late':quarter>=4})
 for (gid,drive,post),d in drives.items():
  if d['inside']:
   games[gid]['teams'][post]['redZoneTrips']+=1
   games[gid]['teams'][post]['redZoneTDs']+=int(d['td'])
 for g in games.values():
  plays=g['plays'];homePrevious=awayPrevious=0
  for period,q in sorted(g['periods'].items(),key=lambda item:int(item[0])):
   q['homePoints']=q['homeCumulative']-homePrevious if q['homeCumulative'] is not None else None
   q['awayPoints']=q['awayCumulative']-awayPrevious if q['awayCumulative'] is not None else None
   if q['homeCumulative'] is not None:homePrevious=q['homeCumulative']
   if q['awayCumulative'] is not None:awayPrevious=q['awayCumulative']
   q['plays']=sorted((p for p in plays if str(min(p['quarter'],5))==period),key=lambda p:-abs(p['homeImpact']))[:2]
  g['quarterScoresValid']=all(str(q) in g['periods'] for q in range(1,5)) and all(q['homePoints'] is not None and q['awayPoints'] is not None and q['homePoints']>=0 and q['awayPoints']>=0 for q in g['periods'].values())
  positive=sorted((p for p in plays if p['homeImpact']>0),key=lambda p:-p['homeImpact'])[:3];negative=sorted((p for p in plays if p['homeImpact']<0),key=lambda p:p['homeImpact'])[:3];late=sorted((p for p in plays if p['late']),key=lambda p:-abs(p['homeImpact']))[:2]
  picked={p['id']:p for p in positive+negative+late};g['plays']=sorted(picked.values(),key=lambda p:-abs(p['homeImpact']))
 return games

if __name__=='__main__':
 season=int(sys.argv[2]) if len(sys.argv)>2 else 2026
 path=ROOT/('web/schedule.json' if season==2026 else f'web/history/schedule-{season}.json')
 schedule=json.loads(path.read_text());finals={g['id'] for g in schedule['games'] if g['homeScore'] is not None and g['awayScore'] is not None}
 with gzip.open(sys.argv[1],'rt',newline='') as f:games=aggregate_factors(csv.DictReader(f),finals)
 scoreMap={g['id']:g for g in schedule['games']}
 for gid,g in games.items():
  final=scoreMap[gid]
  if sum(q['homePoints'] or 0 for q in g['periods'].values())!=final['homeScore'] or sum(q['awayPoints'] or 0 for q in g['periods'].values())!=final['awayScore']:g['quarterScoresValid']=False
 output={'season':season,'fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'nflverse play-by-play snapshot','games':games}
 target=ROOT/('web/factors.json' if season==2026 else f'web/history/factors-{season}.json');target.write_text(json.dumps(output,separators=(',',':')))
 print(f'{season}: factors for {len(games)} completed games',flush=True)
