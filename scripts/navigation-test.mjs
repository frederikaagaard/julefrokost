import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const data=JSON.parse(readFileSync(resolve(root,'data.json'),'utf8'));
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.style={setProperty:(k,v)=>{this.style[k]=v;}};this.dataset={};this.events={};this.classList={add:()=>{},toggle:()=>{}};}
  append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}}
  replaceChildren(...nodes){this.children.forEach(n=>n.parent=null);this.children=[];this.append(...nodes);}
  remove(){if(this.parent){this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;}}
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
// Exercise the real transition path with delayed image decoding and rapid navigation.
const animations=[];
context.window.matchMedia=()=>({matches:false});
context.window.scrollY=640;
Element.prototype.animate=function(keyframes,options){
  let resolve,reject;
  const finished=new Promise((ok,fail)=>{resolve=ok;reject=fail;});
  const animation={finished,keyframes,options,canceled:false,cancel(){this.canceled=true;reject(Error('canceled'));},complete:resolve};
  animations.push(animation);return animation;
};
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
route('#/spillere');
assert.equal(app.children.length,2);
assert.equal(app.children[0].style.top,'-640px');
assert.deepEqual(JSON.parse(JSON.stringify(animations.at(-1).keyframes)),[{opacity:0},{opacity:1}]);
assert.equal(animations.at(-1).options.duration,300);
animations.at(-1).complete();await flush();assert.equal(app.children.length,1);
let release;
const gate=new Promise(resolve=>{release=resolve;});
Element.prototype.decode=()=>gate;
route('#/former/daniel');
assert.equal(app.children.length,1);assert.equal(app.all('button').length,8);
assert.equal(timers.size,0,'Countdown must wait until loader images are ready');
route('#/');release();await flush();
assert.equal(timers.size,0,'Stale decode must not launch the abandoned countdown');
assert.ok(app.children.at(-1).all('a').some(x=>x.textContent==='Start spillet'));
route('#/former/martin');await flush();
assert.equal(app.children.length,2,'Interrupted transitions must keep at most two screens');
assert.equal(body.style.backgroundColor,'#00070c');
assert.equal([...timers.values()][0].ms,5000);
assert.equal(animations.at(-2).canceled,true);
animations.at(-1).complete();await flush();assert.equal(app.children.length,1);
assert.equal(app.all('p')[0].textContent,'Former skæbne');
context.window.matchMedia=()=>({matches:true});
const count=animations.length;route('#/spillere');await flush();
assert.equal(animations.length,count);assert.equal(app.children.length,1);assert.equal(timers.size,0);
console.log('Opaque crossfades, delayed decoding, rapid navigation, loader timing and reduced motion passed.');
