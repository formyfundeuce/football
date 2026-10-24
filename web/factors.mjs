const canonical=t=>t==='LAR'?'LA':t;
export function gameFactorsFor(snapshot,team,week,opponent){
 if(!snapshot)return null;team=canonical(team);opponent=canonical(opponent);
 const game=Object.values(snapshot.games).find(g=>Number(g.week)===Number(week)&&((canonical(g.home)===team&&canonical(g.away)===opponent)||(canonical(g.away)===team&&canonical(g.home)===opponent)));
 if(!game)return null;
 const atHome=canonical(game.home)===team,own=game.teams[atHome?game.home:game.away],other=game.teams[atHome?game.away:game.home];
 if(!own||!other)return null;
 const events=game.plays.map(p=>({...p,impact:p.homeImpact*(canonical(game.home)===team?1:-1)}));
 return {own,other,margin:other.interceptions+other.fumblesLost-own.interceptions-own.fumblesLost,helped:events.filter(p=>p.impact>0).sort((a,b)=>b.impact-a.impact),hurt:events.filter(p=>p.impact<0).sort((a,b)=>a.impact-b.impact),fetchedAt:snapshot.fetchedAt};
}
export function offensiveLeaders(data,team,week){
 const rows=data.filter(p=>canonical(p.team)===canonical(team)&&Number(p.week)===Number(week));
 return [['passing_yards','passing_tds','passing'],['rushing_yards','rushing_tds','rushing'],['receiving_yards','receiving_tds','receiving']].flatMap(([metric,tdMetric,label])=>{
  const p=rows.filter(p=>Number(p[metric])>0).sort((a,b)=>Number(b[metric])-Number(a[metric]))[0];
  return p?[{name:p.player_display_name,label,yards:Number(p[metric]),touchdowns:Number(p[tdMetric])||0}]:[];
 });
}
export function escapeHtml(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
