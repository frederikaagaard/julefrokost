const root=document.createElement('div');root.className='site-navigation';
const home=document.createElement('a');home.href='/';home.className='site-menu-toggle';home.setAttribute('aria-label','Til fælles forside');
const icon=document.createElement('span');icon.className='site-menu-icon';icon.setAttribute('aria-hidden','true');home.append(icon);
root.append(home);document.body.append(root);
