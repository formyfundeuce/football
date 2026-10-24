export function fixtureSelection(game,teamA,teamB){
 const a=[game.home,game.away].includes(teamA),b=[game.home,game.away].includes(teamB);
 return a&&b?'fixture-both':a?'fixture-a':b?'fixture-b':'';
}
