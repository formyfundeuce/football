import {completed,outcome} from './schedule.mjs';
export function scoringBaseline(games,team){
 const rows=games.filter(g=>completed(g)&&(g.home===team||g.away===team));
 if(!rows.length)return {games:0,scored:null,allowed:null};
 return {games:rows.length,scored:rows.reduce((sum,g)=>sum+outcome(g,team).own,0)/rows.length,allowed:rows.reduce((sum,g)=>sum+outcome(g,team).other,0)/rows.length};
}
export function expectedMatchTotal(games,teamA,teamB){
 if(!teamA||!teamB||teamA===teamB)return null;
 const a=scoringBaseline(games,teamA),b=scoringBaseline(games,teamB);
 if(!a.games||!b.games)return null;
 const expectedA=(a.scored+b.allowed)/2,expectedB=(b.scored+a.allowed)/2;
 return {a,b,expectedA,expectedB,total:expectedA+expectedB};
}
