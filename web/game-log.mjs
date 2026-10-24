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
