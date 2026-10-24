export const DISPLAY_ZONE='America/Denver';
export function easternKickoff(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return null;
 const [year,month,day]=date.split('-').map(Number),[hour,minute]=time.split(':').map(Number),target=Date.UTC(year,month-1,day,hour,minute);
 let guess=target;
 const f=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){const p=Object.fromEntries(f.formatToParts(new Date(guess)).map(x=>[x.type,x.value]));const represented=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);guess+=target-represented;}
 return new Date(guess).toISOString();
}
export function completed(g){return Number.isFinite(g.homeScore)&&Number.isFinite(g.awayScore)}
export function teamGames(games,team,now=new Date()){
 const selected=games.filter(g=>g.home===team||g.away===team).sort((a,b)=>a.date.localeCompare(b.date)||(a.kickoff||'').localeCompare(b.kickoff||''));
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:DISPLAY_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const past=selected.filter(completed).reverse();
 const next=selected.find(g=>!completed(g)&&(g.kickoff?Date.parse(g.kickoff)>=now.getTime():g.date>=today))||null;
 const pending=selected.filter(g=>!completed(g)&&(g.kickoff?Date.parse(g.kickoff)<now.getTime():g.date<today));
 return {past,next,pending};
}
export function outcome(g,team){if(!completed(g))return null;const own=g.home===team?g.homeScore:g.awayScore,other=g.home===team?g.awayScore:g.homeScore;return {result:own>other?'W':own<other?'L':'T',own,other}}
export function defaultWeek(games,now=new Date()){
 const next=games.filter(g=>!completed(g)&&(g.kickoff?Date.parse(g.kickoff)>=now.getTime():g.date>=now.toISOString().slice(0,10))).sort((a,b)=>a.date.localeCompare(b.date))[0];
 return next?.week??Math.max(1,...games.map(g=>g.week));
}
export function matchPoints(games){
 const finals=games.filter(completed),total=finals.reduce((sum,g)=>sum+g.homeScore+g.awayScore,0);
 return {games:finals.length,total,average:finals.length?total/finals.length:null};
}
