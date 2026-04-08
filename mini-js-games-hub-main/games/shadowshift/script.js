const canvas=document.getElementById("game");const ctx=canvas.getContext("2d");const overlay=document.getElementById("overlay");const btnStart=document.getElementById("btnStart");const btnRestart=document.getElementById("btnRestart");const timeEl=document.getElementById("time");const cloakEl=document.getElementById("cloak");const toast=document.getElementById("toast");
const W=960,H=600;canvas.width=W;canvas.height=H;
const keys=new Set();let mouse={x:0,y:0,down:false};let dragging=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rectsIntersect(a,b){return !(a.x+a.w<b.x||b.x+b.w<a.x||a.y+a.h<b.y||b.y+b.h<a.y)}
function circleRectPenetration(cx,cy,r,rx,ry,rw,rh){const nx=clamp(cx,rx,rx+rw),ny=clamp(cy,ry,ry+rh);const dx=cx-nx,dy=cy-ny;const d2=dx*dx+dy*dy;if(d2>r*r)return null;const d=Math.sqrt(d2)||1;const px=dx/d*(r-d),py=dy/d*(r-d);return {px,py}}
function segIntersects(a,b,c,d){const s1x=b.x-a.x,s1y=b.y-a.y,s2x=d.x-c.x,s2y=d.y-c.y;const s=(-s1y*(a.x-c.x)+s1x*(a.y-c.y))/(-s2x*s1y+s1x*s2y);const t=( s2x*(a.y-c.y)-s2y*(a.x-c.x))/(-s2x*s1y+s1x*s2y);return s>=0&&s<=1&&t>=0&&t<=1}
function segRectBlock(ax,ay,bx,by,r){const e=[{a:{x:r.x,y:r.y},b:{x:r.x+r.w,y:r.y}},{a:{x:r.x+r.w,y:r.y},b:{x:r.x+r.w,y:r.y+r.h}},{a:{x:r.x+r.w,y:r.y+r.h},b:{x:r.x,y:r.y+r.h}},{a:{x:r.x,y:r.y+r.h},b:{x:r.x,y:r.y}}];for(const ed of e){if(segIntersects({x:ax,y:ay},{x:bx,y:by},ed.a,ed.b))return true}return false}
function losBlocked(ax,ay,bx,by,blocks){for(const r of blocks){if(segRectBlock(ax,ay,bx,by,r))return true}return false}
function rnd(a,b){return Math.random()*(b-a)+a}
function gradientBG(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0b0b14");g.addColorStop(1,"#0a0a12");return g}
const level={
  player:{x:90,y:520,r:12,speed:2.7},
  goal:{x:860,y:70,r:20},
  walls:[
    {x:150,y:470,w:660,h:18},
    {x:150,y:112,w:660,h:18},
    {x:150,y:130,w:18,h:340},
    {x:792,y:130,w:18,h:340},
    {x:260,y:230,w:110,h:20},
    {x:430,y:160,w:20,h:120},
    {x:520,y:300,w:150,h:20},
    {x:720,y:220,w:20,h:120}
  ],
  blockers:[
    {x:310,y:350,w:70,h:28,color:"#7dd3fc"},
    {x:590,y:200,w:84,h:28,color:"#a7f3d0"}
  ],
  lights:[
    {x:330,y:190,r:220,intensity:0.9,color:"rgba(255,240,180,1)"},
    {x:700,y:430,r:240,intensity:0.85,color:"rgba(190,220,255,1)"},
    {x:500,y:380,r:160,intensity:0.95,color:"rgba(255,190,230,1)"}
  ]
};
let state="idle";let t0=0;let elapsed=0;let spotted=false;let win=false;
let cloak={ready:true,active:false,time:0,duration:2.5,cooldown:6,cdLeft:0};
function showToast(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1200)}
function reset(){player.x=level.player.x;player.y=level.player.y;elapsed=0;spotted=false;win=false;cloak.ready=true;cloak.active=false;cloak.time=0;cloak.cdLeft=0}
const player={x:level.player.x,y:level.player.y,r:level.player.r,speed:level.player.speed,color:"#e8e8f3"};
function updateCloak(dt){if(cloak.active){cloak.time+=dt;if(cloak.time>=cloak.duration){cloak.active=false;cloak.time=0;cloak.cdLeft=cloak.cooldown}}else if(!cloak.ready){cloak.cdLeft-=dt;if(cloak.cdLeft<=0){cloak.cdLeft=0;cloak.ready=true}}cloakEl.textContent=cloak.active?`${(cloak.duration-cloak.time).toFixed(1)}s`:(cloak.ready?"Ready":`${cloak.cdLeft.toFixed(1)}s`)}
function handleInput(dt){let dx=0,dy=0;if(keys.has("ArrowUp")||keys.has("w"))dy-=1;if(keys.has("ArrowDown")||keys.has("s"))dy+=1;if(keys.has("ArrowLeft")||keys.has("a"))dx-=1;if(keys.has("ArrowRight")||keys.has("d"))dx+=1;const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const sp=player.speed;let nx=player.x+dx*sp,ny=player.y+dy*sp;for(const r of [...level.walls,...level.blockers]){const pen=circleRectPenetration(nx,ny,player.r,r.x,r.y,r.w,r.h);if(pen){nx+=pen.px;ny+=pen.py}}nx=clamp(nx,player.r,W-player.r);ny=clamp(ny,player.r,H-player.r);player.x=nx;player.y=ny}
function drawLights(){for(const l of level.lights){const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r);g.addColorStop(0,`${l.color}`);g.addColorStop(0.15,`${l.color}`);g.addColorStop(1,"rgba(0,0,0,0)");ctx.globalCompositeOperation="lighter";ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,l.r,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation="source-over"}}
function drawWalls(){ctx.fillStyle="#22223b";for(const r of level.walls){ctx.fillRect(r.x,r.y,r.w,r.h)}}
function drawBlockers(){for(const b of level.blockers){ctx.fillStyle=b.color;ctx.fillRect(b.x,b.y,b.w,b.h);ctx.strokeStyle="rgba(255,255,255,.15)";ctx.strokeRect(b.x,b.y,b.w,b.h)}}
function drawPlayer(){ctx.save();if(cloak.active){ctx.globalAlpha=0.5}ctx.fillStyle=player.color;ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawGoal(){ctx.strokeStyle="#9afc8b";ctx.lineWidth=4;ctx.beginPath();ctx.arc(level.goal.x,level.goal.y,level.goal.r,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1}
function drawOcclusion(){ctx.fillStyle="rgba(10,10,16,.86)";for(const r of level.walls){ctx.fillRect(r.x,r.y,r.w,r.h)}for(const b of level.blockers){ctx.fillRect(b.x,b.y,b.w,b.h)}}
function drawDetectionOverlay(){if(spotted){ctx.fillStyle="rgba(255,0,70,.15)";ctx.fillRect(0,0,W,H)}}
function checkDetection(){if(cloak.active)return false;for(const l of level.lights){const dx=player.x-l.x,dy=player.y-l.y;const d2=dx*dx+dy*dy;const r2=l.r*l.r;if(d2<=r2){if(!losBlocked(l.x,l.y,player.x,player.y,[...level.walls,...level.blockers]))return true}}return false}
function checkWin(){const d=Math.hypot(player.x-level.goal.x,player.y-level.goal.y);return d<=level.goal.r-2}
function update(dt){if(state!=="play")return;elapsed+=dt;timeEl.textContent=elapsed.toFixed(1);handleInput(dt);updateCloak(dt);if(checkWin()){win=true;state="idle";overlay.style.display="grid";overlay.firstElementChild.querySelector("h1").textContent="Level Complete";overlay.firstElementChild.querySelector("p").textContent=`Time ${elapsed.toFixed(1)}s`;overlay.firstElementChild.querySelector("button").textContent="Play Again";return}spotted=checkDetection();if(spotted){state="idle";overlay.style.display="grid";overlay.firstElementChild.querySelector("h1").textContent="Detected";overlay.firstElementChild.querySelector("p").textContent="Try moving panels or using cloak";overlay.firstElementChild.querySelector("button").textContent="Retry"}}
function render(){ctx.fillStyle=gradientBG();ctx.fillRect(0,0,W,H);drawLights();drawOcclusion();drawWalls();drawBlockers();drawGoal();drawPlayer();drawDetectionOverlay()}
let last=0;function loop(ts){const dt=Math.min(0.033,(ts-last)/1000||0);last=ts;update(dt);render();requestAnimationFrame(loop)}requestAnimationFrame(loop);
canvas.addEventListener("mousemove",e=>{const rect=canvas.getBoundingClientRect();mouse.x=(e.clientX-rect.left)*(canvas.width/rect.width);mouse.y=(e.clientY-rect.top)*(canvas.height/rect.height);if(dragging){const b=dragging;const ox=b.w*0.5,oy=b.h*0.5;b.x=clamp(mouse.x-ox,0,W-b.w);b.y=clamp(mouse.y-oy,0,H-b.h);for(const w of level.walls){if(rectsIntersect(b,w)){if(b.x+ox< w.x) b.x=w.x-b.w; else if(b.x+ox> w.x+w.w) b.x=w.x+w.w; if(b.y+oy< w.y) b.y=w.y-b.h; else if(b.y+oy> w.y+w.h) b.y=w.y+w.h}}}});
canvas.addEventListener("mousedown",e=>{mouse.down=true;for(const b of level.blockers){if(mouse.x>=b.x&&mouse.x<=b.x+b.w&&mouse.y>=b.y&&mouse.y<=b.y+b.h){dragging=b;break}}});
window.addEventListener("mouseup",()=>{mouse.down=false;dragging=null});
window.addEventListener("keydown",e=>{if(e.key===" "){if(state==="play"){if(cloak.ready&&!cloak.active){cloak.active=true;cloak.ready=false;cloak.time=0;showToast("Cloak engaged")}}e.preventDefault()}if(e.key==="r"||e.key==="R"){reset();overlay.style.display="none";state="play"}keys.add(e.key)});
window.addEventListener("keyup",e=>{keys.delete(e.key)});
btnStart.addEventListener("click",()=>{overlay.style.display="none";reset();state="play";t0=performance.now()});
btnRestart.addEventListener("click",()=>{reset();overlay.style.display="none";state="play"});
overlay.addEventListener("click",e=>{if(e.target.id==="overlay")return;overlay.style.display="none";reset();state="play"});
