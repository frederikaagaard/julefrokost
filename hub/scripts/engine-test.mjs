import assert from 'node:assert/strict';
import {Runner,TEMPTATIONS} from '../dist/temptation/engine.mjs';
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
assert.equal(g.over,false);assert.ok(g.score>=100);assert.equal(seen.size,TEMPTATIONS.length);
assert.ok(g.speed<=16);assert.ok(g.obstacles.length<12);
// Grounded and airborne collision thresholds; scored obstacles count only once.
const c=new Runner(()=>.5);c.obstacles=[{z:.63,emoji:'🍑',scored:false}];c.step(1/120);assert.equal(c.over,true);
const safe=new Runner(()=>.5);safe.y=1.4;safe.vy=0;safe.obstacles=[{z:.63,emoji:'💸',scored:false}];
for(let i=0;i<25;i++)safe.step(1/120);assert.equal(safe.over,false);assert.equal(safe.score,1);
const freeze=safe.distance;safe.over=true;safe.step(1/60);assert.equal(safe.distance,freeze);
console.log('No-input K.O., restart, no double jump, 100 consecutive jumps, all 8 emojis, collision and scoring passed.');
// Lane changes are bounded and take time; adjacent-lane obstacles do not collide.
const lanes=new Runner(()=>.5);lanes.move(-1);lanes.move(-1);assert.equal(lanes.lane,-1);
assert.equal(lanes.x,0);for(let i=0;i<12;i++)lanes.step(1/120);assert.ok(Math.abs(lanes.x+.5)<1e-9);
for(let i=0;i<13;i++)lanes.step(1/120);assert.equal(lanes.x,-1);
lanes.move(1);lanes.move(1);lanes.move(1);assert.equal(lanes.lane,1);
lanes.reset();assert.equal(lanes.x,0);assert.equal(lanes.lane,0);
lanes.obstacles=[{z:.63,lane:1,emoji:'🍑',scored:false}];lanes.step(1/120);assert.equal(lanes.over,false);
const crossing=new Runner(()=>.5);crossing.x=.8;crossing.lane=1;
crossing.obstacles=[{z:.63,lane:1,emoji:'🍑',scored:false}];crossing.step(1/120);assert.equal(crossing.over,true);
const waves=new Runner(()=>.5);waves.obstacles=[];waves.score=1;waves.spawn();assert.equal(waves.obstacles.length,1);
waves.obstacles=[];waves.score=2;waves.spawn();assert.equal(waves.obstacles.length,2);
assert.equal(Math.abs(waves.obstacles[0].z-waves.obstacles[1].z),2);
assert.ok(waves.obstacles.every(o=>o.lane!==o.safeLane));
// Check that a player who jumps full-width rows can follow the generated safe corridor across many runs.
for(let run=1;run<=50;run++){
 let seed=run;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const player=new Runner(rng);let completed=false;
 for(let i=0;i<40000;i++){
  const next=player.obstacles.filter(o=>o.z>.62).sort((a,b)=>a.z-b.z)[0];
  if(next&&next.z<player.speed*.7+.62)player.move(next.safeLane-player.lane);
  if(next?.jumpRequired&&next.z<player.speed*.28+.62&&player.y===0)player.jump();
  player.step(1/120);
  assert.equal(player.over,false,`Mixed course failed on seed ${run}`);
  assert.ok(player.obstacles.every(o=>[-1,0,1].includes(o.lane)));
  if(player.score>=100){completed=true;break;}
 }
 assert.ok(completed);
}
console.log('Three lanes, lane-change collision, 2-point staggered groups and 50 traversable 100-point courses passed.');

const wall=new Runner(()=>.5);wall.score=6;wall.wave=3;wall.obstacles=[];wall.spawn(4);
assert.equal(wall.obstacles.length,3);assert.equal(new Set(wall.obstacles.map(o=>o.z)).size,1);
assert.ok(wall.obstacles.every(o=>o.jumpRequired));
const grounded=new Runner(()=>.5);grounded.obstacles=wall.obstacles.map(o=>({...o,z:.63}));grounded.step(1/120);assert.equal(grounded.over,true);
wall.jump();for(let i=0;i<70&&!wall.over;i++)wall.step(1/120);assert.equal(wall.over,false);assert.equal(wall.score,9);
console.log('Full-width rows require a jump and can be cleared; mixed courses stay traversable at the faster pace.');
