export function fixtureSelection(game,teamA,teamB){
 const a=[game.home,game.away].includes(teamA),b=[game.home,game.away].includes(teamB);
 return a&&b?'fixture-both':a?'fixture-a':b?'fixture-b':'';
}
export function teamNameClass(team,teamA,teamB){return team===teamA&&team===teamB?'fixture-name-both':team===teamA?'fixture-name-a':team===teamB?'fixture-name-b':''}
