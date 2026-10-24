export function quarterSummary(snapshot,rows,playerId,metric){
 if(!snapshot?.metrics.includes(metric))return null;
 const covered=new Set(snapshot.coveredGames);
 const known=rows.filter(r=>{const entry=snapshot.players[playerId+'|'+r.week];if(entry)return covered.has(entry.gameId);return snapshot.coveredGames.some(id=>{const parts=id.split('_');return Number(parts[1])===Number(r.week)&&[parts[2],parts[3]].includes(r.team)})});
 const values=[1,2,3,4,5].map(q=>known.reduce((sum,r)=>sum+(snapshot.players[playerId+'|'+r.week]?.quarters[String(q)]?.[metric]??0),0));
 return {games:known.length,requested:rows.length,totals:values,averages:values.map(v=>known.length?v/known.length:null)};
}
