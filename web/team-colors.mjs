export function fixtureSelection(game,teamA,teamB){
 const a=[game.home,game.away].includes(teamA),b=[game.home,game.away].includes(teamB);
 return a&&b?'fixture-both':a?'fixture-a':b?'fixture-b':'';
}
export function teamNameClass(team,teamA,teamB){return team===teamA&&team===teamB?'fixture-name-both':team===teamA?'fixture-name-a':team===teamB?'fixture-name-b':''}

// nflverse team colors, with user-requested Broncos orange and Saints brown accents.
export const TEAM_COLORS={"ARI":"#97233F","ATL":"#A71930","BAL":"#241773","BUF":"#00338D","CAR":"#0085CA","CHI":"#0B162A","CIN":"#FB4F14","CLE":"#FF3C00","DAL":"#002244","DEN":"#FB4F14","DET":"#0076B6","GB":"#203731","HOU":"#03202F","IND":"#002C5F","JAX":"#006778","KC":"#E31837","LA":"#003594","LAC":"#007BC7","LV":"#000000","MIA":"#008E97","MIN":"#4F2683","NE":"#002244","NO":"#8B6F47","NYG":"#0B2265","NYJ":"#003F2D","PHI":"#004C54","PIT":"#000000","SEA":"#002244","SF":"#AA0000","TB":"#A71930","TEN":"#4495D2","WAS":"#5A1414"};

export function teamTheme(team){
 const aliases={LAR:'LA',STL:'LA',OAK:'LV',SD:'LAC'};const primary=TEAM_COLORS[aliases[team]||team]||'#718069';
 const rgb=primary.slice(1).match(/../g).map(h=>parseInt(h,16));const linear=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});const luminance=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];
 const contrast=1.05/(luminance+.05)>=4.5?'#ffffff':'#111111';
 const tint='#'+rgb.map(v=>Math.round(v*.1+255*.9).toString(16).padStart(2,'0')).join('');
 return {primary,contrast,tint,ink:'#172923'};
}
export function teamThemeStyle(team){const t=teamTheme(team);return `--franchise-primary:${t.primary};--franchise-contrast:${t.contrast};--franchise-tint:${t.tint};--franchise-ink:${t.ink}`}
