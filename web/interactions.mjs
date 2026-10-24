export function compareMatch(button,{get,populate,render}){
 for(const [side,team] of [['A',button.dataset.away],['B',button.dataset.home]]){
  const select=get('team'+side);
  if([...select.options].some(option=>option.value===team))select.value=team;
  populate(side);
 }
 render();
 const comparison=get('teamComparison');
 comparison.focus({preventScroll:true});
 comparison.scrollIntoView({behavior:'smooth',block:'start'});
}
