export const TEMPTATIONS = ['🍑','🍈','🚬','🍺','🍔','🦠','💊','💸'];
export class Runner {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() {
    this.score = 0; this.time = 0; this.speed = 8; this.y = 0; this.vy = 0;
    this.lane = 0; this.x = 0; this.safeLane = 1; this.wave = 0;
    this.obstacles = []; this.nextSpawn = 1.5; this.distance = 0;
    this.over = false; this.culprit = ''; this.bag = []; this.buffer = 0;
    this.spawn(20, true);
  }
  nextEmoji() {
    if (!this.bag.length) {
      this.bag = [...TEMPTATIONS];
      for (let i=this.bag.length-1;i>0;i--) {
        const j=Math.floor(this.random()*(i+1));
        [this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];
      }
    }
    return this.bag.pop();
  }
  spawn(z = 32, first = false) {
    const choices=[-1,0,1].filter(lane=>Math.abs(lane-this.safeLane)<=1);
    const safe=first?1:choices[Math.floor(this.random()*choices.length)];
    const occupied=[-1,0,1].filter(lane=>lane!==safe);
    const lanes=first?[0]:this.score<10?[occupied[Math.floor(this.random()*occupied.length)]]:occupied;
    const reverse=this.random()<.5;
    lanes.forEach((lane,index)=>this.obstacles.push({
      z:z+(reverse?lanes.length-1-index:index)*2,
      lane, safeLane:safe, wave:this.wave, emoji:this.nextEmoji(), scored:false
    }));
    this.safeLane=safe;this.wave++;
  }
  move(direction) {
    if(this.over) return;
    this.lane=Math.max(-1,Math.min(1,this.lane+Math.sign(direction)));
  }
  jump() {
    if (this.over) return false;
    if (this.y === 0) { this.vy=8; this.buffer=0; return true; }
    this.buffer=.1; return false;
  }
  step(dt) {
    if (this.over || dt<=0) return;
    dt=Math.min(dt,1/30); this.time+=dt;
    this.speed=Math.min(14,8+this.score*.13); this.distance+=this.speed*dt;
    const shift=this.lane-this.x;
    this.x+=Math.sign(shift)*Math.min(Math.abs(shift),5*dt);
    this.buffer=Math.max(0,this.buffer-dt);
    if (this.y>0 || this.vy>0) {
      this.y=Math.max(0,this.y+this.vy*dt-10*dt*dt); this.vy-=20*dt;
      if(this.y===0) { this.vy=0; if(this.buffer>0)this.jump(); }
    }
    this.nextSpawn-=dt;
    if(this.nextSpawn<=0) {
      this.spawn(); this.nextSpawn=Math.max(1.08,1.5-this.score*.005)+this.random()*.25;
    }
    for (const obstacle of this.obstacles) {
      obstacle.z-=this.speed*dt;
      if (obstacle.z<.62 && obstacle.z>-.62 && this.y<.72 && Math.abs(this.x-(obstacle.lane??0))<.58) {
        this.over=true; this.culprit=obstacle.emoji; return;
      }
      if(obstacle.z<-.72 && !obstacle.scored) { obstacle.scored=true; this.score++; }
    }
    this.obstacles=this.obstacles.filter(o=>o.z>-5);
  }
}
