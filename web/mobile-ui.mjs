export const MOBILE_VIEWS=['matches','teams','players'];
export const PLAYER_TABS=['averages','quarters','chart','logs'];
export function mobileRoute(view,tab='averages',teamTab='review'){
 return {view:MOBILE_VIEWS.includes(view)?view:'players',tab:PLAYER_TABS.includes(tab)?tab:'averages',teamTab:['summary','review','predict','history'].includes(teamTab)?teamTab:'review'};
}
export function createMobileUI({get,win=window,doc=document}){
 const media=win.matchMedia('(max-width:760px)'),body=doc.body,dialog=get('mobileSelectionDialog'),dock=doc.querySelector('.player-control-dock'),calendar=get('matchCalendar'),groups=[get('playerPerformance'),get('teamPerformance'),get('gamePredict'),get('teamHistory')];
 let active=false,route=mobileRoute('matches','averages','summary'),restoreGroups=[],restoreCalendar=false,moved=[],status='none';
 try{const saved=JSON.parse(localStorage.getItem('nfl-mobile-route-v2'));if(Array.isArray(saved)&&saved.length)route=mobileRoute(...saved)}catch{}
 function setRoute(view,tab=route.tab,teamTab=route.teamTab,scroll=true){
  route=mobileRoute(view,tab,teamTab);if(route.teamTab==='review'&&status!=='completed'||route.teamTab==='predict'&&status!=='upcoming')route.teamTab='summary';body.dataset.mobileView=route.view;body.dataset.playerTab=route.tab;body.dataset.teamTab=route.teamTab;
  for(const button of doc.querySelectorAll('[data-mobile-nav]')){const selected=button.dataset.mobileNav===route.view;button.setAttribute('aria-current',selected?'page':'false')}
  for(const button of doc.querySelectorAll('button[data-player-tab]'))button.setAttribute('aria-pressed',String(button.dataset.playerTab===route.tab));
  for(const button of doc.querySelectorAll('button[data-team-tab]'))button.setAttribute('aria-pressed',String(button.dataset.teamTab===route.teamTab));
  if(active){calendar.open=true;for(const group of groups)group.open=true;if(route.view==='players'&&route.tab==='logs')get('quarterPerformance').open=true}
  try{localStorage.setItem('nfl-mobile-route-v2',JSON.stringify([route.view,route.tab,route.teamTab]))}catch{}
  if(active&&scroll)win.scrollTo({top:0,behavior:'auto'});
 }
 function restoreFields(){for(const item of [...moved].reverse())item.parent.insertBefore(item.node,item.next?.parentNode===item.parent?item.next:null);moved=[];body.classList.remove('mobile-picker-open')}
 function closePicker(){if(dialog.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')}restoreFields();if(active)get('mobileChange').focus({preventScroll:true})}
 function openPicker(){
  if(!active||route.view!=='players'||dialog.open)return;
  for(const node of [dock.querySelector('.sticky-team-selectors'),dock.querySelector('.controls'),doc.querySelector('.toolbar-actions')]){moved.push({node,parent:node.parentNode,next:node.nextSibling});(node.classList.contains('toolbar-actions')?get('mobileSelectionUtilities'):get('mobileSelectionFields')).append(node)}
  body.classList.add('mobile-picker-open');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 }
 function updateMode(){
  if(media.matches&&!active){active=true;restoreGroups=groups.map(group=>{try{const stored=localStorage.getItem('nfl-'+group.id+'-open');if(stored!==null)return stored==='true'}catch{}return group.open});restoreCalendar=calendar.open;body.classList.add('mobile-app');setRoute(route.view,route.tab,route.teamTab,false)}
  else if(!media.matches&&active){closePicker();active=false;body.classList.remove('mobile-app');groups.forEach((g,i)=>g.open=restoreGroups[i]);calendar.open=restoreCalendar}
 }
 for(const button of doc.querySelectorAll('[data-mobile-nav]'))button.onclick=()=>setRoute(button.dataset.mobileNav);
 for(const button of doc.querySelectorAll('button[data-player-tab]'))button.onclick=()=>setRoute('players',button.dataset.playerTab);
 for(const button of doc.querySelectorAll('button[data-team-tab]'))button.onclick=()=>setRoute('teams',route.tab,button.dataset.teamTab);
 get('mobileChange').onclick=openPicker;get('mobileSelectionDone').onclick=closePicker;
 dialog.addEventListener('close',restoreFields);dialog.addEventListener('click',event=>{if(event.target===dialog)closePicker()});
 if(media.addEventListener)media.addEventListener('change',updateMode);else media.addListener(updateMode);
 updateMode();
 return {get isMobile(){return active},refresh(){setRoute(route.view,route.tab,route.teamTab,false)},setMatchStatus(value){status=value;body.dataset.matchState=value;doc.querySelector('button[data-team-tab=review]').hidden=value!=='completed';doc.querySelector('button[data-team-tab=predict]').hidden=value!=='upcoming';setRoute(route.view,route.tab,route.teamTab,false)},updateSelection(a,b){get('mobileSelectionA').textContent=a;get('mobileSelectionB').textContent=b},showTeams(){if(!active)return false;setRoute('teams',route.tab,'summary');return true},showPlayers(){if(!active)return false;setRoute('players','averages');return true}};
}
