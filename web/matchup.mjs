import {completed,outcome} from './schedule.mjs';
import {expectedMatchTotal,scoringBaseline} from './expected-total.mjs';
export function matchState(game){return !game?'none':completed(game)?'completed':'upcoming'}
export function predictionForMatch(games,match){
 if(!match||completed(match))return null;
 const prior=games.filter(g=>completed(g)&&g.id!==match.id&&g.date<match.date),away=match.away,home=match.home;
 const matches=team=>prior.filter(g=>g.home===team||g.away===team).sort((a,b)=>b.date.localeCompare(a.date));
 const aGames=matches(away),bGames=matches(home),opponent=(g,team)=>g.home===team?g.away:g.home;
 const shared=[...new Set(aGames.map(g=>opponent(g,away)))].filter(team=>bGames.some(g=>opponent(g,home)===team)).slice(0,6).map(team=>({team,a:scoringBaseline(aGames.filter(g=>opponent(g,away)===team),away),b:scoringBaseline(bGames.filter(g=>opponent(g,home)===team),home)}));
 return {estimate:expectedMatchTotal(prior,away,home),prior,away:{team:away,games:aGames,recent:aGames.slice(0,3).map(g=>({...g,...outcome(g,away),opponent:opponent(g,away)}))},home:{team:home,games:bGames,recent:bGames.slice(0,3).map(g=>({...g,...outcome(g,home),opponent:opponent(g,home)}))},shared};
}
