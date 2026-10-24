export function appearances(data,id,window='all') {
 const rows=data.filter(r=>r.player_id===id).sort((a,b)=>Number(a.week)-Number(b.week));
 return window==='5'?rows.slice(-5):rows;
}
export function average(data,id,metric,window='all') {
 const rows=appearances(data,id,window);
 return rows.length?rows.reduce((s,r)=>s+Number(r[metric]),0)/rows.length:null;
}
export function roster(data,team,position) {
 const latest=new Map();
 [...data].sort((a,b)=>Number(a.week)-Number(b.week)).forEach(r=>latest.set(r.player_id,r));
 return [...latest.values()].filter(r=>r.team===team&&r.position===position).sort((a,b)=>a.player_display_name.localeCompare(b.player_display_name));
}
