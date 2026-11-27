import assert from 'node:assert/strict';
import {Runner,TEMPTATIONS} from '../dist/engine.mjs';
let seed=47;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const g=new Runner(random);
for(let i=0;i<1000&&!g.over;i++)g.step(1/120);
assert.ok(g.over);assert.equal(g.score,0);assert.ok(TEMPTATIONS.includes(g.culprit));
g.reset();assert.equal(g.over,false);assert.equal(g.y,0);assert.equal(g.obstacles.length,1);
assert.equal(g.jump(),true);g.step(1/120);const velocity=g.vy;assert.equal(g.jump(),false);assert.equal(g.vy,velocity);
// A player who times every jump can clear every emoji, even at maximum speed.
g.reset();const seen=new Set();
for(let i=0;i<120*240&&!g.over&&g.score<100;i++){
 const next=g.obstacles.find(o=>o.z>.62);
 if(next){seen.add(next.emoji);if(next.z<g.speed*.36+.62&&g.y===0)g.jump();}
 g.step(1/120);
}
assert.equal(g.over,false);assert.equal(g.score,100);assert.equal(seen.size,TEMPTATIONS.length);
assert.ok(g.speed<=14);assert.ok(g.obstacles.length<8);
// Grounded and airborne collision thresholds; scored obstacles count only once.
const c=new Runner(()=>.5);c.obstacles=[{z:.63,emoji:'🍑',scored:false}];c.step(1/120);assert.equal(c.over,true);
const safe=new Runner(()=>.5);safe.y=1.4;safe.vy=0;safe.obstacles=[{z:.63,emoji:'💸',scored:false}];
for(let i=0;i<25;i++)safe.step(1/120);assert.equal(safe.over,false);assert.equal(safe.score,1);
const freeze=safe.distance;safe.over=true;safe.step(1/60);assert.equal(safe.distance,freeze);
console.log('No-input K.O., restart, no double jump, 100 consecutive jumps, all 8 emojis, collision and scoring passed.');
