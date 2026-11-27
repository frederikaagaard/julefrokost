import {Runner,TEMPTATIONS} from './engine.mjs';
const $=id=>document.getElementById(id);
const canvas=$('world'), ctx=canvas.getContext('2d'), game=new Runner();
let state='intro', best=0, last=0, accumulator=0, width=0, height=0, scale=1, koAt=0;
try { best=Math.max(0,Number(localStorage.getItem('game-of-fate-runner-best'))||0); } catch {}
$('best').textContent=String(best).padStart(3,'0');
for(const [index,emoji] of TEMPTATIONS.entries()){const slot=document.createElement('span');slot.className='orbit-slot';slot.style.setProperty('--angle',`${index*45}deg`);const symbol=document.createElement('span');symbol.textContent=emoji;slot.append(symbol);$('emoji-orbit').append(slot);}
const emojiFont='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
function resize(){const rect=$('game').getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);scale=width/400;}
window.addEventListener('resize',resize);
new ResizeObserver(resize).observe($('game'));
window.visualViewport?.addEventListener('resize',resize);resize();
function show(id){for(const name of ['intro','result','pause'])$(name).hidden=name!==id;$('hint').hidden=!!id;$('game').dataset.screen=id||'playing';$('wordmark').src=id==='intro'?'/game-home-logo.svg':'/butterfly/assets/2b90f964111f2aef.svg';document.querySelector('meta[name="theme-color"]').content=id==='intro'?'#7e3331':'#e6e2dc';}
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
$('game').addEventListener('pointerdown',event=>{
  if(event.target.closest('button')||state!=='playing')return;
  event.preventDefault();
  const rect=$('game').getBoundingClientRect(), position=(event.clientX-rect.left)/rect.width;
  if(position<1/3)game.move(-1);else if(position>2/3)game.move(1);else game.jump();
});
window.addEventListener('keydown',event=>{
  if(!['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(event.code))return;
  event.preventDefault();if(event.repeat)return;
  if(state==='playing'){
    if(event.code==='ArrowLeft')game.move(-1);else if(event.code==='ArrowRight')game.move(1);else game.jump();
  }else if(state==='paused')resume();else if(state==='intro'||performance.now()-koAt>300)start();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();accumulator=0;});
window.addEventListener('blur',pause);
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function project(z,lane=0){const k=10/(z+10);return {k,x:width/2+lane*width*.25*k,y:height*.22+(height*.82-height*.22)*k};}
function draw(){
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.filter='none';
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#e6e2dc';ctx.fillRect(0,0,width,height);
  const center=width/2, ground=height*.82, horizon=height*.22;

  // A continuously scrolling football pitch, projected onto the same ground as the runner.
  const point=(z,lane)=>{const p=project(z,lane);return [p.x,p.y];};
  polygon([point(50,-1.8),point(50,1.8),point(-3,1.8),point(-3,-1.8)],'#247331');
  for(let i=0;i<14;i++){
    const z=i*4-(game.distance%8)-4, near=Math.max(-3,z),far=Math.min(50,z+4);
    if(far<=near)continue;
    polygon([point(far,-1.8),point(far,1.8),point(near,1.8),point(near,-1.8)],i%2?'#2d843b':'#349344');
  }
  // Fine grass blades stay attached to the moving surface.
  ctx.strokeStyle='#56a34c';ctx.lineWidth=.7;
  for(let i=0;i<100;i++){
    const z=((i*7.37-game.distance)%44+44)%44-2;
    const p=project(z,((i*1.618)%3.4)-1.7);
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+1.2*p.k,p.y-3*p.k);ctx.stroke();
  }
  const marking=(points,closed=false)=>{
    ctx.strokeStyle='#f5f4e7';ctx.lineWidth=Math.max(1,2*scale);ctx.lineJoin='round';ctx.beginPath();
    points.forEach(([z,lane],i)=>{const p=project(z,lane);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});
    if(closed)ctx.closePath();ctx.stroke();
  };
  for(const side of [-1,1])marking([[50,side*1.55],[-3,side*1.55]]);
  const obstacles=[...game.obstacles].sort((a,b)=>b.z-a.z);
  for(const o of obstacles.filter(o=>o.z>=0))drawObstacle(o);
  drawPerson(project(0,game.x).x,ground);
  for(const o of obstacles.filter(o=>o.z<0))drawObstacle(o);
}
function drawObstacle(o){
  const p=project(o.z,o.lane??0), size=74*scale*p.k, x=p.x;
  ellipse(x,p.y+3*scale*p.k,size*.45,size*.11,'#285b35');
  ctx.font=`${size}px ${emojiFont}`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(o.emoji,x,p.y+size*.08);
}
function limb(x,y,length,angle,color,w){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,length);ctx.stroke();ctx.restore();}
function drawPerson(x,ground){
  const s=scale, jumping=game.y>.01, cycle=game.distance*1.5;
  const stride=state==='playing'&&!jumping?Math.sin(cycle)*.55:0;
  const y=ground-game.y*64*s;
  ellipse(x,ground+5*s,(24-game.y*4)*s,7*s,'#285b35');
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  const bob=jumping?0:Math.abs(Math.sin(cycle))*2;ctx.translate(0,-bob);
  limb(-9,-27,29,stride,'#cb8d68',10);limb(9,-27,29,-stride,'#efb48d',10);
  // A tiny, deliberately serious runner in white underpants.
  polygon([[-17,-65],[17,-65],[14,-30],[-14,-30]],'#e6a27b');
  polygon([[0,-65],[17,-65],[14,-30],[0,-30]],'#c88762');
  limb(-18,-60,25,jumping?.95:-stride*.8,'#cb8d68',8);limb(18,-60,25,jumping?-.95:stride*.8,'#efb48d',8);
  polygon([[-15,-38],[15,-38],[13,-22],[2,-25],[0,-30],[-3,-25],[-13,-22]],'#e6e2dc');
  ctx.fillStyle='#fff';ctx.fillRect(-15,-38,30,4);
  ellipse(0,-78,15,18,'#efb48d');ellipse(5,-78,10,17,'#d69570');
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
