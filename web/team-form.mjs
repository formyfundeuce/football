import {completed,outcome} from './schedule.mjs';
export function teamForm(games,team){
 const rows=games.filter(g=>completed(g)&&(g.home===team||g.away===team)).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.week-a.week),results=rows.map(g=>outcome(g,team));
 const mean=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null,recent=results.slice(0,5);
 return {games:rows.length,wins:results.filter(r=>r.result==='W').length,losses:results.filter(r=>r.result==='L').length,ties:results.filter(r=>r.result==='T').length,scored:mean(results.map(r=>r.own)),allowed:mean(results.map(r=>r.other)),recentScored:mean(recent.map(r=>r.own)),recentAllowed:mean(recent.map(r=>r.other)),recent:rows.slice(0,5).map(g=>({...g,...outcome(g,team),opponent:g.home===team?g.away:g.home})).reverse()};
}
