import {roster,appearances} from './compare.mjs';
export function rankedRoster(data,team,position){
 const totals=new Map();for(const p of roster(data,team,position)){const rows=appearances(data,p.player_id),sum=metric=>rows.reduce((s,r)=>s+Number(r[metric]||0),0);totals.set(p.player_id,{yards:position==='QB'?sum('passing_yards'):position==='RB'?sum('rushing_yards')+sum('receiving_yards'):sum('receiving_yards'),tds:position==='QB'?sum('passing_tds'):position==='RB'?sum('rushing_tds')+sum('receiving_tds'):sum('receiving_tds'),interceptions:sum('interceptions'),games:rows.length})}
 return roster(data,team,position).sort((a,b)=>{const x=totals.get(a.player_id),y=totals.get(b.player_id);return y.yards-x.yards||y.tds-x.tds||(position==='QB'?x.interceptions-y.interceptions:0)||y.games-x.games||a.player_display_name.localeCompare(b.player_display_name)});
}
