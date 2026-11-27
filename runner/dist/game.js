import {Runner} from './engine.mjs';
const $=id=>document.getElementById(id);
const canvas=$('world'), ctx=canvas.getContext('2d'), game=new Runner();
let state='intro', best=0, last=0, accumulator=0, width=0, height=0, scale=1, koAt=0;
try { best=Math.max(0,Number(localStorage.getItem('game-of-fate-runner-best'))||0); } catch {}
$('best').textContent=String(best).padStart(3,'0');
const emojiFont='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function resize(){const rect=$('game').getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width/400,height/700);}
window.addEventListener('resize',resize);resize();
function show(id){for(const name of ['intro','result','pause'])$(name).hidden=name!==id;$('hint').hidden=!!id;}
function start(){game.reset();state='playing';accumulator=0;last=performance.now();$('score').textContent='000';show(null);}
function pause(){if(state!=='playing')return;state='paused';show('pause');}
function resume(){state='playing';last=performance.now();accumulator=0;show(null);}
function lose(){
  state='over';koAt=performance.now();const record=game.score>best;
  best=Math.max(best,game.score);try{localStorage.setItem('game-of-fate-runner-best',String(best));}catch{}
  $('best').textContent=String(best).padStart(3,'0');$('final-score').textContent=game.score;
  $('culprit').textContent=game.culprit;$('record-label').textContent=record?'NY REKORD. SAMME SKÆBNE.':'DIN SKÆBNE INDHENTEDE DIG';show('result');
  if(navigator.vibrate)navigator.vibrate(35);
}
$('start').addEventListener('click',start);
$('retry').addEventListener('click',()=>{if(performance.now()-koAt>300)start();});
$('resume').addEventListener('click',resume);
$('game').addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;if(state==='playing'){event.preventDefault();game.jump();}});
window.addEventListener('keydown',event=>{if(!['Space','ArrowUp'].includes(event.code))return;event.preventDefault();if(event.repeat)return;if(state==='playing')game.jump();else if(state==='paused')resume();else if(state==='intro'||performance.now()-koAt>300)start();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();accumulator=0;});
window.addEventListener('blur',pause);
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function project(z){const k=7/(z+7);return {k,y:height*.30+(height*.78-height*.30)*k};}
function draw(){
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#03070a';ctx.fillRect(0,0,width,height);
  const center=width/2, ground=height*.78, horizon=height*.30;
  const glow=ctx.createRadialGradient(center,horizon,0,center,horizon,width*.65);glow.addColorStop(0,'#0b2936');glow.addColorStop(1,'#03070a');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  polygon([[center-width*.055,horizon],[center+width*.055,horizon],[width*1.3,height],[-width*.3,height]],'#0a1720');
  ctx.lineWidth=1;
  for(const side of [-1,1]){ctx.strokeStyle='#214655';ctx.beginPath();ctx.moveTo(center+side*width*.055,horizon);ctx.lineTo(center+side*width*.8,height);ctx.stroke();}
  for(let i=0;i<12;i++){
    const z=(i*3-(game.distance%3)+36)%36, p=project(z), half=width*.26*p.k;
    ctx.strokeStyle=`rgba(72,203,243,${.05+.12*p.k})`;ctx.beginPath();ctx.moveTo(center-half,p.y);ctx.lineTo(center+half,p.y);ctx.stroke();
  }
  // Small roadside markers establish depth without extra obstacles.
  for(let i=0;i<9;i++)for(const side of [-1,1]){
    const p=project((i*4-(game.distance%4)+36)%36), x=center+side*width*.34*p.k;
    ctx.fillStyle='#48cbf3';ctx.globalAlpha=.15+.3*p.k;ctx.fillRect(x,p.y-12*scale*p.k,2*scale*p.k,12*scale*p.k);ctx.globalAlpha=1;
  }
  const obstacles=[...game.obstacles].sort((a,b)=>b.z-a.z);
  for(const o of obstacles.filter(o=>o.z>=0))drawObstacle(o);
  drawPerson(center,ground);
  for(const o of obstacles.filter(o=>o.z<0))drawObstacle(o);
}
function drawObstacle(o){
  const p=project(o.z), size=74*scale*p.k, x=width/2;
  ellipse(x,p.y+3*scale*p.k,size*.45,size*.11,'#00000050');
  ctx.font=`${size}px ${emojiFont}`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(o.emoji,x,p.y+size*.08);
}
function limb(x,y,length,angle,color,w){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,length);ctx.stroke();ctx.restore();}
function drawPerson(x,ground){
  const s=scale, jumping=game.y>.01, cycle=game.distance*1.5;
  const stride=state==='playing'&&!jumping?Math.sin(cycle)*.55:0;
  const y=ground-game.y*64*s;
  ellipse(x,ground+5*s,(24-game.y*4)*s,7*s,`rgba(0,0,0,${.5-game.y*.12})`);
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  const bob=jumping?0:Math.abs(Math.sin(cycle))*2;ctx.translate(0,-bob);
  limb(-9,-27,29,stride,'#caa18a',10);limb(9,-27,29,-stride,'#e6bca2',10);
  // A tiny, deliberately serious runner in white underpants.
  polygon([[-17,-65],[17,-65],[14,-30],[-14,-30]],'#ddae94');
  polygon([[0,-65],[17,-65],[14,-30],[0,-30]],'#c69681');
  limb(-18,-60,25,jumping?.95:-stride*.8,'#caa18a',8);limb(18,-60,25,jumping?-.95:stride*.8,'#e6bca2',8);
  polygon([[-15,-38],[15,-38],[13,-22],[2,-25],[0,-30],[-3,-25],[-13,-22]],'#e6e2dc');
  ctx.fillStyle='#fff';ctx.fillRect(-15,-38,30,4);
  ellipse(0,-78,15,18,'#e6bca2');ellipse(5,-78,10,17,'#d3a68f');
  ctx.fillStyle='#382b25';ctx.beginPath();ctx.arc(0,-83,15,Math.PI,0);ctx.fill();
  ctx.strokeStyle='#80634f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-89);ctx.lineTo(-4,-76);ctx.stroke();
  ctx.restore();
}
function frame(now){
  const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
  if(state==='playing'){
    accumulator+=dt;while(accumulator>=1/120){game.step(1/120);accumulator-=1/120;if(game.over){lose();break;}}
    $('score').textContent=String(game.score).padStart(3,'0');
  }
  draw();requestAnimationFrame(frame);
}
show('intro');requestAnimationFrame(frame);
