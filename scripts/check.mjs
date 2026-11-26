import {readFileSync, statSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const data=JSON.parse(readFileSync(resolve(root,'data.json'),'utf8'));
assert.equal(data.profiles.length,8);
assert.equal(new Set(data.profiles.map(p=>p.key)).size,8);
const assets=new Set();
function inspect(obj){if(!obj||typeof obj!=='object')return;for(const [key,value]of Object.entries(obj)){if(key==='src'||key==='back'){assert.ok(!/^https?:/.test(value),'Temporary remote asset');assets.add(value);}else inspect(value);}}
inspect(data);
for(const src of assets){const path=resolve(root,src);assert.ok(existsSync(path),`Missing ${src}`);assert.ok(statSync(path).size>0,`Empty ${src}`);}
for(const p of data.profiles){assert.ok(p.name&&p.player&&p.story.length>100);assert.equal(p.facts.length,6);assert.ok(p.portrait&&p.flag);assert.ok(p.gallery.filter(x=>x.kind==='image').length>=4);assert.ok(p.gallery.every((x,i,a)=>!i||x.y>=a[i-1].y));}
const app=readFileSync(resolve(root,'app.js'),'utf8');
assert.ok(app.includes('}, 5000)'),'Reveal must last 5 seconds');
for(const route of ['#/','#/spillere','#/former/','#/profil/'])assert.ok(app.includes(route));
console.log(`Validated ${data.profiles.length} complete profiles and ${assets.size} local assets.`);
