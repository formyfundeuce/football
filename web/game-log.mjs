import {average} from './compare.mjs';
import {outcome,completed} from './schedule.mjs';
const canonical=team=>team==='LAR'?'LA':team;
export function belowAveragePlayers(data,team,week,metric,window='all'){
 return data.filter(r=>canonical(r.team)===canonical(team)&&Number(r.week)===Number(week)).map(r=>{
  const value=Number(r[metric]),baseline=average(data,r.player_id,metric,window);
  return {...r,value,baseline,difference:baseline===null?null:value-baseline};
 }).filter(r=>Number.isFinite(r.value)&&Number.isFinite(r.baseline)&&r.difference < -1e-9).sort((a,b)=>a.difference-b.difference||a.player_display_name.localeCompare(b.player_display_name));
}
export function gameResult(games,row){
 const team=canonical(row.team),opponent=canonical(row.opponent_team);
 const game=games.find(g=>Number(g.week)===Number(row.week)&&((canonical(g.home)===team&&canonical(g.away)===opponent)||(canonical(g.away)===team&&canonical(g.home)===opponent)));
 if(!game)return {label:'—',className:'unknown',score:null};
 if(!completed(game))return {label:'Pending',className:'pending',score:null};
 const result=outcome({...game,home:canonical(game.home),away:canonical(game.away)},team);
 return {label:result.result==='W'?'Win':result.result==='L'?'Loss':'Tie',className:result.result==='W'?'win':result.result==='L'?'loss':'tie',score:result.own+'–'+result.other};
}
export function teamWeeklyReports(data,games,team,window='all',metric='all'){
 const supported=['passing_yards','passing_tds','interceptions','rushing_yards','rushing_tds','receptions','receiving_yards','receiving_tds','targets','carries','fantasy_points_ppr'];
 const metrics=metric==='all'?supported:[metric],byPlayer=new Map();
 for(const row of data){if(!byPlayer.has(row.player_id))byPlayer.set(row.player_id,[]);byPlayer.get(row.player_id).push(row)}
 const baselines=new Map();for(const [id,rows] of byPlayer){const selected=[...rows].sort((a,b)=>Number(a.week)-Number(b.week));const sample=window==='5'?selected.slice(-5):selected;baselines.set(id,Object.fromEntries(metrics.map(m=>[m,average(sample,id,m)])))}
 return games.filter(g=>(canonical(g.home)===canonical(team)||canonical(g.away)===canonical(team))&&completed(g)).sort((a,b)=>b.week-a.week).map(game=>{
  const rows=data.filter(r=>canonical(r.team)===canonical(team)&&Number(r.week)===Number(game.week)),players=[];
  for(const row of rows){const below=metrics.map(m=>({metric:m,value:Number(row[m]),baseline:baselines.get(row.player_id)?.[m]})).filter(s=>Number.isFinite(s.value)&&Number.isFinite(s.baseline)&&s.baseline-s.value>=5).map(s=>({...s,difference:s.value-s.baseline}));if(below.length)players.push({...row,below})}
  players.sort((a,b)=>a.player_display_name.localeCompare(b.player_display_name));
  const opponent=canonical(game.home)===canonical(team)?game.away:game.home;
  return {week:game.week,opponent,result:gameResult([game],{team,opponent_team:opponent,week:game.week}),players,appearances:rows.length};
 });
}
