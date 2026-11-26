const app = document.querySelector('#app');
const data = await fetch('data.json').then(r => { if (!r.ok) throw Error('Indhold kunne ikke hentes'); return r.json(); });
const profiles = new Map(data.profiles.map(p => [p.key, p]));
let generationTimer;
let renderVersion = 0;
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
function image(asset, alt = '', eager = false) {
  const img = el('img'); img.src = asset.src; img.alt = alt; img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy'; return img;
}
function navigate(route) { if (location.hash === route) render(); else location.hash = route; }
function brand(asset = data.logo) {
  const a = el('a', 'brand'); a.href = '#/'; a.setAttribute('aria-label', 'Game of Fate — start');
  a.append(image(asset, 'Game of Fate', true)); return a;
}
function header(profile) {
  const bar = el('header', 'topbar'); bar.append(brand());
  if (profile) {
    const a = el('a', 'back'); a.href = '#/spillere'; a.setAttribute('aria-label', 'Tilbage til spillere');
    const im = el('img'); im.src = data.back; im.alt = ''; a.append(im); bar.append(a);
  } return bar;
}
function photo(asset, alt, portrait = false) {
  const wrap = el('div', 'photo' + (portrait ? ' portrait' : '')); wrap.style.aspectRatio = `${asset.width} / ${asset.height}`;
  wrap.dataset.figmaNode = asset.id;
  const img = image(asset, alt, portrait);
  Object.assign(img.style, {left:'0',top:'0',width:'100%',height:'100%',objectFit:'cover'}, asset.crop);
  wrap.append(img); return wrap;
}
function home() {
  const page = el('section', 'screen home');
  const art = image(data.homeImage, '', true); art.className = 'home-art';
  const logo = brand(data.homeLogo); logo.classList.add('home-brand');
  const start = el('a', 'pill start', 'Start spillet'); start.href = '#/spillere';
  page.append(art, logo, start); return page;
}
function players() {
  const page = el('section', 'screen players'); page.append(header());
  page.append(el('h1', '', 'Vælg en spiller'));
  const list = el('nav', 'player-list'); list.setAttribute('aria-label', 'Spillere');
  for (const p of data.profiles) {
    const button = el('button', 'pill player', p.player);
    button.addEventListener('click', () => navigate(`#/former/${p.key}`)); list.append(button);
  } page.append(list); return page;
}
function generating(p) {
  const page = el('section', 'screen generating');
  const circle = image(data.loading, '', true); circle.className = 'orbit';
  const label = el('p', '', 'Former skæbne'); label.setAttribute('role', 'status');
  page.append(circle, label);
  // Start loading the selected portrait while the five-second reveal runs.
  const preload = new Image(); preload.src = p.portrait.src;
  const version = renderVersion;
  generationTimer = setTimeout(() => {
    if (version === renderVersion) location.replace(`#/profil/${p.key}`);
  }, 5000);
  return page;
}
function profile(p) {
  const page = el('article', 'screen profile'); page.append(header(true));
  const heading = el('div', 'profile-heading');
  const flag = image(p.flag, '', true); flag.className = 'flag'; flag.style.width = `${p.flag.width}px`;
  heading.append(flag, el('h1', '', p.name)); page.append(heading, photo(p.portrait, p.name, true));
  const facts = el('dl', 'facts');
  ['Nationalitet','Bopæl','Årstal','Alder','Karriere','Civilstand'].forEach((label,i) => {
    const cell = el('div', 'fact'); cell.append(el('dt','',label), el('dd','',p.facts[i])); facts.append(cell);
  }); page.append(facts);
  const story = el('section', 'story'); story.append(el('h2','','Skæbne'), el('p','',p.story)); page.append(story);
  const gallery = el('section', 'gallery'); gallery.setAttribute('aria-label', `Billeder fra ${p.name}s liv`);
  for (const item of p.gallery) {
    if (item.kind === 'caption') gallery.append(el('p','caption',item.text));
    else if (item.kind === 'brand') {
      const panel = el('div','brand-panel'); const inner = el('div','brand-panel-inner');
      inner.append(el('b','','Haldcore'),image(item.image,'',false)); panel.append(inner); gallery.append(panel);
    } else gallery.append(photo(item, `Fra ${p.name}s liv`));
  } page.append(gallery);
  const back = el('a', 'pill return', 'Tilbage til virkeligheden'); back.href = '#/spillere'; page.append(back);
  return page;
}
function render() {
  clearTimeout(generationTimer); renderVersion++;
  const path = location.hash.slice(1).split('/').filter(Boolean); const p = profiles.get(path[1]);
  let page;
  const dark = !path.length || path[0] === 'former' && p;
  document.body.classList.toggle('dark', !!dark);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#0e0e0e' : '#e6e2dc';
  if (path[0] === 'spillere') page = players();
  else if (path[0] === 'former' && p) page = generating(p);
  else if (path[0] === 'profil' && p) page = profile(p);
  else page = home();
  document.title = path[0] === 'profil' && p ? `${p.name} — Game of Fate` : 'Game of Fate';
  app.replaceChildren(page); window.scrollTo(0,0);
}
window.addEventListener('hashchange', render);
render();
