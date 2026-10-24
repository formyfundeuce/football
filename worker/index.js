// ASSETS is embedded by scripts/build.mjs; no credentials are bundled.
const SEASON=2026;
const SCHEDULE_URL='https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv';
export function normalizeSchedule(rows,season=SEASON){return rows.filter(r=>Number(r.season)===season&&r.game_type==='REG'&&/^\d{4}-\d{2}-\d{2}$/.test(r.gameday)).map(r=>({id:r.game_id,week:Number(r.week),date:r.gameday,home:r.home_team==='LAR'?'LA':r.home_team,away:r.away_team==='LAR'?'LA':r.away_team,homeScore:r.home_score?.trim()!==''&&Number.isFinite(Number(r.home_score))?Number(r.home_score):null,awayScore:r.away_score?.trim()!==''&&Number.isFinite(Number(r.away_score))?Number(r.away_score):null,kickoff:easternKickoff(r.gameday,r.gametime),stadium:r.stadium||''})).filter(g=>g.home&&g.away&&g.week>=1&&g.week<=18)}
function json(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}})}
export function parseCSV(text,fields=null){
 const rows=[];let header=null,row=[],field='',quoted=false,column=0,object={};const wanted=fields?new Set(fields):null;
 function cell(){if(!header)row.push(field);else if(!wanted||wanted.has(header[column]))object[header[column]]=field;field='';column++}
 function finish(){cell();if(!header)header=row;else if(Object.values(object).some(Boolean))rows.push(object);row=[];object={};column=0}
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted)cell();else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;finish()}else field+=c}
 if(field||column)finish();return rows;
}
export function normalizeStats(rows,season=SEASON){const fields=['passing_yards','passing_tds','rushing_yards','rushing_tds','receiving_yards','receiving_tds','receptions','carries','targets','fantasy_points_ppr'];return rows.filter(r=>r.season_type==='REG'&&Number(r.season)===season&&['QB','RB','WR','TE'].includes(r.position)&&Number(r.week)>=1&&Number(r.week)<=18).map(r=>({player_id:r.player_id,player_display_name:r.player_display_name,position:r.position,team:r.team||r.recent_team,week:Number(r.week),opponent_team:r.opponent_team,interceptions:Number(r.passing_interceptions??r.interceptions??0),...Object.fromEntries(fields.map(k=>[k,Number(r[k]||0)]))})).filter(r=>r.player_id&&r.player_display_name&&fields.every(k=>Number.isFinite(r[k])))}
async function cached(request,key,ttl,ctx,loader){const cache=globalThis.caches?.default;const cacheKey=new Request(new URL('/__cache/'+key,new URL(request.url).origin));const hit=cache?await cache.match(cacheKey):null;if(hit)return hit;const value=await loader();const result=json(value);if(cache){const stored=new Response(result.clone().body,{headers:{'content-type':'application/json','cache-control':`public, max-age=${ttl}`}});const task=cache.put(cacheKey,stored);if(ctx?.waitUntil)ctx.waitUntil(task);else await task}return result}
const STATS_FIELDS=['season','season_type','position','player_id','player_display_name','team','recent_team','week','opponent_team','passing_interceptions','interceptions','passing_yards','passing_tds','rushing_yards','rushing_tds','receiving_yards','receiving_tds','receptions','carries','targets','fantasy_points_ppr'];
const SCHEDULE_FIELDS=['season','game_type','game_id','week','gameday','gametime','home_team','away_team','home_score','away_score','stadium'];
export function requestedSeason(url){const raw=url.searchParams.get('season');if(raw===null)return SEASON;if(!/^20[0-9]{2}$/.test(raw)||Number(raw)<2020||Number(raw)>SEASON)return null;return Number(raw)}
function snapshot(kind,season){const path=season===SEASON?'/'+(kind==='stats'?'data':kind)+'.json':'/history/'+kind+'-'+season+'.json';const asset=ASSETS[path];if(!asset)throw Error('No saved data is available for this season. Please refresh to try again.');return JSON.parse(asset.body)}
export default {async fetch(request,env={},ctx={}){
 const url=new URL(request.url);if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed'},405);
 try{
  if(['/api/stats','/api/schedule','/api/quarters'].includes(url.pathname)){
   const season=requestedSeason(url);if(season===null)return json({error:'Choose a season from 2020 to 2026.'},400);
   if(url.pathname==='/api/quarters')return json(snapshot('quarters',season));
   const isStats=url.pathname==='/api/stats',kind=isStats?'stats':'schedule';
   return await cached(request,kind+'-'+season,season===SEASON?(isStats?3600:900):86400,ctx,async()=>{
    try{
     const source=isStats?`https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player_week_${season}.csv`:SCHEDULE_URL;
     const res=await fetch(source,{signal:AbortSignal.timeout(25000)});if(!res.ok)throw Error();
     const rows=parseCSV(await res.text(),isStats?STATS_FIELDS:SCHEDULE_FIELDS),games=isStats?normalizeStats(rows,season):normalizeSchedule(rows,season);if(!games.length)throw Error();
     return {season,fetchedAt:new Date().toISOString(),source:'nflverse',games};
    }catch{return snapshot(kind,season)}
   });
  }
  const asset=ASSETS[url.pathname==='/'?'/index.html':url.pathname];if(!asset)return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:asset.body,{headers:{'content-type':asset.type,'cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
 }catch{return json({error:'Data for the selected season is temporarily unavailable. Please refresh to try again.'},502)}
}};
