import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const data=JSON.parse(readFileSync(resolve(root,'data.json'),'utf8'));
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.style={};this.dataset={};this.events={};this.classList={add:()=>{},toggle:()=>{}};}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(k,v){this[k]=v;}
  addEventListener(k,v){this.events[k]=v;}
  all(tag){return[this,...this.children.flatMap(x=>x.all(tag))].filter(x=>!tag||x.tag===tag);}
}
const app=new Element('main'), body=new Element('body'),meta=new Element('meta');
const listeners={},timers=new Map();let timerId=0,scrolls=0;
const location={hash:'',replace(hash){this.hash=hash;}};
const context={document:{body,querySelector:q=>q==='#app'?app:meta,createElement:t=>new Element(t)},
  fetch:async()=>({ok:true,json:async()=>data}),Image:class{},location,
  window:{scrollTo:()=>scrolls++,addEventListener:(k,fn)=>listeners[k]=fn},
  setTimeout:(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
await vm.runInNewContext(`(async()=>{${readFileSync(resolve(root,'app.js'),'utf8')}\n})()`,context);
function route(hash){location.hash=hash;listeners.hashchange();}
assert.equal(app.all('a').find(x=>x.textContent==='Start spillet').href,'#/spillere');
route('#/spillere');assert.equal(app.all('button').length,8);
for(let i=0;i<8;i++){
  route('#/spillere'); app.all('button')[i].events.click(); listeners.hashchange();
  const p=data.profiles[i];assert.equal(location.hash,`#/former/${p.key}`);
  assert.equal(timers.size,1);const timer=[...timers.values()][0];assert.equal(timer.ms,5000);
  assert.equal(app.all('p')[0].textContent,'Former skæbne');
  timer.fn();listeners.hashchange();assert.equal(location.hash,`#/profil/${p.key}`);
  assert.equal(app.all('h1')[0].textContent,p.name);assert.equal(app.all('dd').length,6);
  assert.equal(app.all('a').find(x=>x.textContent==='Tilbage til virkeligheden').href,'#/spillere');
  assert.equal(app.all('a').find(x=>x.className==='brand').href,'#/');
  assert.equal(timers.size,0);
}
route('#/former/daniel');assert.equal(timers.size,1);route('#/');assert.equal(timers.size,0);
assert.ok(app.all('a').some(x=>x.textContent==='Start spillet'));
route('#/profil/missing');assert.ok(app.all('a').some(x=>x.textContent==='Start spillet'));
assert.ok(scrolls>=25);console.log('All 8 player journeys, exact 5-second timer, return links, logo links and interrupted reveal passed.');
