export const MOBILE_VIEWS=['matches','teams','players'];
export const PLAYER_TABS=['averages','quarters','logs','chart'];
export function mobileRoute(view,tab='averages',teamTab='review'){
 return {view:MOBILE_VIEWS.includes(view)?view:'players',tab:PLAYER_TABS.includes(tab)?tab:'averages',teamTab:['summary','review'].includes(teamTab)?teamTab:'review'};
}
export function createMobileUI({get,win=window,doc=document}){
 const media=win.matchMedia('(max-width:760px)'),body=doc.body,dialog=get('mobileSelectionDialog'),dock=doc.querySelector('.player-control-dock'),calendar=get('matchCalendar'),groups=[get('playerPerformance'),get('teamPerformance')];
 let active=false,route=mobileRoute('players'),restoreGroups=[],restoreCalendar=false,moved=[];
 try{route=mobileRoute(...JSON.parse(localStorage.getItem('nfl-mobile-route')||'[]'))}catch{}
 function setRoute(view,tab=route.tab,teamTab=route.teamTab,scroll=true){
  route=mobileRoute(view,tab,teamTab);body.dataset.mobileView=route.view;body.dataset.playerTab=route.tab;body.dataset.teamTab=route.teamTab;
  for(const button of doc.querySelectorAll('[data-mobile-nav]')){const selected=button.dataset.mobileNav===route.view;button.setAttribute('aria-current',selected?'page':'false')}
  for(const button of doc.querySelectorAll('[data-player-tab]'))button.setAttribute('aria-pressed',String(button.dataset.playerTab===route.tab));
  for(const button of doc.querySelectorAll('[data-team-tab]'))button.setAttribute('aria-pressed',String(button.dataset.teamTab===route.teamTab));
  if(active){calendar.open=true;for(const group of groups)group.open=true;if(route.view==='players'&&route.tab==='logs')get('quarterPerformance').open=true}
  try{localStorage.setItem('nfl-mobile-route',JSON.stringify([route.view,route.tab,route.teamTab]))}catch{}
  if(active&&scroll)win.scrollTo({top:0,behavior:'auto'});
 }
 function restoreFields(){for(const item of [...moved].reverse())item.parent.insertBefore(item.node,item.next?.parentNode===item.parent?item.next:null);moved=[];body.classList.remove('mobile-picker-open')}
 function closePicker(){if(dialog.open){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')}restoreFields();if(active)get('mobileChange').focus({preventScroll:true})}
 function openPicker(){
  if(!active||dialog.open)return;
  for(const node of [dock.querySelector('.sticky-team-selectors'),dock.querySelector('.controls'),doc.querySelector('.toolbar-actions')]){moved.push({node,parent:node.parentNode,next:node.nextSibling});(node.classList.contains('toolbar-actions')?get('mobileSelectionUtilities'):get('mobileSelectionFields')).append(node)}
  body.classList.add('mobile-picker-open');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 }
 function updateMode(){
  if(media.matches&&!active){active=true;restoreGroups=groups.map(group=>{try{const stored=localStorage.getItem('nfl-'+group.id+'-open');if(stored!==null)return stored==='true'}catch{}return group.open});restoreCalendar=calendar.open;body.classList.add('mobile-app');setRoute(route.view,route.tab,route.teamTab,false)}
  else if(!media.matches&&active){closePicker();active=false;body.classList.remove('mobile-app');groups.forEach((g,i)=>g.open=restoreGroups[i]);calendar.open=restoreCalendar}
 }
 for(const button of doc.querySelectorAll('[data-mobile-nav]'))button.onclick=()=>setRoute(button.dataset.mobileNav);
 for(const button of doc.querySelectorAll('[data-player-tab]'))button.onclick=()=>setRoute('players',button.dataset.playerTab);
 for(const button of doc.querySelectorAll('[data-team-tab]'))button.onclick=()=>setRoute('teams',route.tab,button.dataset.teamTab);
 get('mobileChange').onclick=openPicker;get('mobileSelectionDone').onclick=closePicker;
 dialog.addEventListener('close',restoreFields);dialog.addEventListener('click',event=>{if(event.target===dialog)closePicker()});
 if(media.addEventListener)media.addEventListener('change',updateMode);else media.addListener(updateMode);
 updateMode();
 return {get isMobile(){return active},refresh(){setRoute(route.view,route.tab,route.teamTab,false)},updateSelection(a,b){get('mobileSelectionA').textContent=a;get('mobileSelectionB').textContent=b},showPlayers(){if(!active)return false;setRoute('players','averages');return true}};
}
