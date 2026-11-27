const root=document.createElement('div');root.className='site-navigation';
const shade=document.createElement('div');shade.className='site-menu-shade';shade.hidden=true;
const toggle=document.createElement('button');toggle.type='button';toggle.className='site-menu-toggle';
toggle.setAttribute('aria-label','Åbn menu');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','site-menu-card');
const icon=document.createElement('span');icon.className='site-menu-icon';icon.setAttribute('aria-hidden','true');toggle.append(icon);
const menu=document.createElement('nav');menu.id='site-menu-card';menu.className='site-menu-card';menu.hidden=true;menu.setAttribute('aria-label','Fælles navigation');
const home=document.createElement('a');home.href='/';home.textContent='Til forsiden';menu.append(home);
function setOpen(open){
  shade.hidden=!open;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Luk menu':'Åbn menu');
  if(open){document.dispatchEvent(new Event('site-menu-open'));home.focus();}else toggle.focus();
}
toggle.addEventListener('click',()=>setOpen(menu.hidden));shade.addEventListener('click',()=>setOpen(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();setOpen(false);}});
root.append(shade,toggle,menu);document.body.append(root);
