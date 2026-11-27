export const TEMPTATIONS = ['🍑','🍈','🚬','🍺','🍔','🦠','💊','💸'];
export class Runner {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() {
    this.score = 0; this.time = 0; this.speed = 8; this.y = 0; this.vy = 0;
    this.obstacles = []; this.nextSpawn = 1.5; this.distance = 0;
    this.over = false; this.culprit = ''; this.bag = []; this.buffer = 0;
    this.spawn(20);
  }
  spawn(z = 32) {
    if (!this.bag.length) {
      this.bag = [...TEMPTATIONS];
      for (let i=this.bag.length-1;i>0;i--) {
        const j=Math.floor(this.random()*(i+1));
        [this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];
      }
    }
    this.obstacles.push({z, emoji:this.bag.pop(), scored:false});
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
      if (obstacle.z<.62 && obstacle.z>-.62 && this.y<.72) {
        this.over=true; this.culprit=obstacle.emoji; return;
      }
      if(obstacle.z<-.72 && !obstacle.scored) { obstacle.scored=true; this.score++; }
    }
    this.obstacles=this.obstacles.filter(o=>o.z>-5);
  }
}
