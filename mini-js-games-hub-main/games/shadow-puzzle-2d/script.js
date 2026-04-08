/* Shadow Puzzle 2D
   - Canvas-driven shapes (rect, circle, triangle)
   - Drag shapes or drag the light source
   - Shadows are rendered as projected polygons away from light
   - Compare generated silhouette against target silhouette (pixel-compare)
   - Uses online sound assets (Google Actions sound library)
*/

// ========== Helpers ==========
const $ = id => document.getElementById(id);
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const dist = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

// ========== Canvas & State ==========
const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let W = canvas.width, H = canvas.height;

// highDPI scaling for crispness
function fitCanvas(){
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);
  W = rect.width; H = rect.height;
}
fitCanvas();
window.addEventListener('resize', () => { fitCanvas(); render(); });

// SFX & Ambience
const sfxClick = $('sfxClick'); const sfxWin = $('sfxWin'); const sfxDrop = $('sfxDrop'); const ambience = $('ambience');
const soundEnabled = ()=>$('sfxToggle').checked;
const musicEnabled = ()=>$('musicToggle').checked;
$('sfxToggle').addEventListener('change', ()=> {});
$('musicToggle').addEventListener('change', ()=> {
  if(musicEnabled()) { ambience.volume=0.25; ambience.play().catch(()=>{}); }
  else { ambience.pause(); ambience.currentTime=0; }
});

// ========== Game Objects ==========
let levelIndex = 0;

// Each level: objects array (type, x,y,rotation,scale), target silhouette (built from shapes)
const LEVELS = [
  // Level 1: simple 2-piece silhouette (a circle + rectangle overlap)
  {
    name: 'Gentle Lamp',
    objects: [
      {type:'rect', x:300, y:280, w:140, h:30, angle: -0.25, fill:'#2b6b9a'},
      {type:'circle', x:360, y:230, r:40, fill:'#5bb8ff'}
    ],
    target: [
      {type:'rect', x:420, y:260, w:160, h:90, angle:0, fill:'#000'},
    ],
    attempts: 999
  },
  // Level 2: three objects
  {
    name: 'Keyhole',
    objects: [
      {type:'circle', x:220, y:260, r:28, fill:'#e07a5f'},
      {type:'rect', x:270, y:300, w:120, h:28, angle:0.12, fill:'#f4d35e'},
      {type:'triangle', x:360, y:220, size:60, angle:-0.3, fill:'#81b29a'}
    ],
    target: [
      {type:'rect', x:360, y:240, w:240, h:120, angle:0, fill:'#000'}
    ]
  },
  // Level 3: advanced silhouette (cross-like)
  {
    name: 'Cross Light',
    objects: [
      {type:'rect', x:240, y:240, w:32, h:150, angle:0.0, fill:'#9d4edd'},
      {type:'rect', x:300, y:280, w:150, h:32, angle:0, fill:'#ff7b00'},
      {type:'circle', x:360, y:200, r:28, fill:'#ffd166'}
    ],
    target:[
      {type:'rect', x:380, y:220, w:220, h:160, angle:0, fill:'#000'}
    ]
  }
];

// Clone helper
function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

// In-level runtime arrays
let objects = [];
let light = { x: 520, y: 120, intensity: 480, glow:1.0 };
let dragging = null; // {type:'light'|'obj', ptrId, offset}
let paused = false;
let lastRender = 0;

// ========== Input (mouse/touch) ==========
canvas.addEventListener('pointerdown', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  // prefer object drag if pointer near object
  let found = null;
  for(let i=objects.length-1;i>=0;i--){
    const o = objects[i];
    if(pointInObject(p,o)){ found = {obj:o, idx:i}; break;}
  }
  if(found){
    dragging = {type:'obj', obj:found.obj, startX:found.obj.x, startY:found.obj.y, offset:{x:p.x - found.obj.x, y:p.y - found.obj.y}, id:e.pointerId};
    canvas.setPointerCapture(e.pointerId);
    if(soundEnabled()) sfxClick.play().catch(()=>{});
    return;
  }
  // if click near light -> drag light
  if(dist(p, light) < 48){
    dragging = {type:'light', id:e.pointerId, offset:{x:p.x - light.x, y:p.y - light.y}};
    canvas.setPointerCapture(e.pointerId);
    if(soundEnabled()) sfxClick.play().catch(()=>{});
    return;
  }
});

canvas.addEventListener('pointermove', (e)=>{
  if(!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  if(dragging.type === 'light'){
    light.x = clamp(p.x - dragging.offset.x, 0, W);
    light.y = clamp(p.y - dragging.offset.y, 0, H);
    render();
  } else if(dragging.type === 'obj'){
    dragging.obj.x = p.x - dragging.offset.x;
    dragging.obj.y = p.y - dragging.offset.y;
    render();
  }
});

canvas.addEventListener('pointerup', (e)=>{
  if(dragging && dragging.type==='obj' && soundEnabled()) sfxDrop.play().catch(()=>{});
  if(dragging) { canvas.releasePointerCapture(e.pointerId); dragging = null; }
});

// convenience: click on canvas toggles a small nudge for light
canvas.addEventListener('dblclick', (e)=>{
  const rect = canvas.getBoundingClientRect();
  light.x = e.clientX - rect.left;
  light.y = e.clientY - rect.top;
  render();
});

// ========== Geometry utilities ==========
function pointInObject(p,o){
  if(o.type==='circle') return (Math.hypot(p.x-o.x, p.y-o.y) <= o.r);
  if(o.type==='rect'){
    // rotate point inverse
    const cos = Math.cos(-o.angle||0), sin = Math.sin(-o.angle||0);
    const dx = p.x - o.x, dy = p.y - o.y;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return Math.abs(rx) <= (o.w/2) && Math.abs(ry) <= (o.h/2);
  }
  if(o.type==='triangle'){
    // equilateral triangle by center and size
    const pts = trianglePoints(o);
    return pointInPoly(p, pts);
  }
  return false;
}
function pointInPoly(pt, poly){
  // ray-casting
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i].x, yi=poly[i].y, xj=poly[j].x, yj=poly[j].y;
    const intersect = ((yi>pt.y)!=(yj>pt.y)) && (pt.x < (xj-xi)*(pt.y-yi)/(yj-yi)+xi);
    if(intersect) inside=!inside;
  }
  return inside;
}
function rectPoints(o){
  const hw=o.w/2, hh=o.h/2, a=o.angle||0;
  const cos=Math.cos(a), sin=Math.sin(a);
  return [
    {x:o.x + (-hw)*cos - (-hh)*sin, y:o.y + (-hw)*sin + (-hh)*cos},
    {x:o.x + ( hw)*cos - (-hh)*sin, y:o.y + ( hw)*sin + (-hh)*cos},
    {x:o.x + ( hw)*cos - ( hh)*sin, y:o.y + ( hw)*sin + ( hh)*cos},
    {x:o.x + (-hw)*cos - ( hh)*sin, y:o.y + (-hw)*sin + ( hh)*cos}
  ];
}
function trianglePoints(o){
  const s=o.size||60, a=o.angle||0;
  // triangle centered at (x,y), point up by default
  const h = s * Math.sqrt(3)/2;
  const pts = [
    {x:o.x, y:o.y - (2/3)*h},
    {x:o.x - s/2, y:o.y + (1/3)*h},
    {x:o.x + s/2, y:o.y + (1/3)*h}
  ];
  // rotate around center
  const cos=Math.cos(a), sin=Math.sin(a);
  return pts.map(p=>{
    const dx=p.x - o.x, dy=p.y - o.y;
    return { x: o.x + dx * cos - dy * sin, y: o.y + dx * sin + dy * cos };
  });
}

// project polygon points away from light to create shadow poly
function projectPoints(pts, lightPos, distanceScale=6.0){
  return pts.map(p=>{
    const vx = p.x - lightPos.x;
    const vy = p.y - lightPos.y;
    return { x: p.x + vx * distanceScale, y: p.y + vy * distanceScale };
  });
}

// draw helpers
function drawObject(o){
  ctx.save();
  ctx.fillStyle = o.fill || '#888';
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1.5;
  if(o.type==='circle'){
    ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  } else if(o.type==='rect'){
    ctx.translate(o.x,o.y); ctx.rotate(o.angle||0);
    ctx.beginPath(); ctx.roundRect(-o.w/2, -o.h/2, o.w, o.h, 6); ctx.fill(); ctx.stroke();
    ctx.setTransform(1,0,0,1,0,0); // reset
  } else if(o.type==='triangle'){
    const pts = trianglePoints(o);
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y); ctx.lineTo(pts[2].x, pts[2].y); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// ========== Rendering ==========
function clear(){
  ctx.clearRect(0,0,W,H);
  // subtle vignette
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(255,255,255,0.01)'); g.addColorStop(1,'rgba(0,0,0,0.08)');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
}

function renderShadows(){
  // render shadow shapes by drawing large projected polygons in dark color, then blur/alpha
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(0,0,0,0.95)';
  objects.forEach(o=>{
    let pts = [];
    if(o.type==='circle'){
      // approximate circle with poly
      const seg=18;
      for(let i=0;i<seg;i++){
        const ang = (i/seg) * Math.PI*2;
        pts.push({ x: o.x + Math.cos(ang)*o.r, y: o.y + Math.sin(ang)*o.r });
      }
    } else if(o.type==='rect') pts = rectPoints(o);
    else if(o.type==='triangle') pts = trianglePoints(o);

    const proj = projectPoints(pts, light, 8 + (light.intensity/300));
    // create polygon connecting pts and projected reversed (to cap)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
    for(let i=proj.length-1;i>=0;i--) ctx.lineTo(proj[i].x, proj[i].y);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function renderLight(){
  // radial gradient to simulate glow; multiply to brighten objects
  const grd = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.intensity);
  grd.addColorStop(0, `rgba(255,220,120,${0.45 * light.glow})`);
  grd.addColorStop(0.25, `rgba(255,180,80,${0.25 * light.glow})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(light.x, light.y, light.intensity, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // draw central bulb
  ctx.save();
  ctx.beginPath(); ctx.arc(light.x, light.y, 8 + light.glow*6, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,235,170,0.98)'; ctx.fill();
  ctx.restore();
}

function renderObjects(){
  // draw objects on top of shadows (silhouette visible)
  objects.forEach(o => {
    // subtle inner glow when near light
    const d = Math.hypot(o.x - light.x, o.y - light.y);
    const glowAlpha = clamp(1 - (d / (light.intensity*1.2)), 0, 0.55);
    ctx.save();
    ctx.shadowColor = 'rgba(255,200,120,' + (0.32 * glowAlpha * light.glow) + ')';
    ctx.shadowBlur = 14 * glowAlpha * light.glow;
    drawObject(o);
    ctx.restore();
  });
}

function renderTargetSilhouette(){
  // draw the target silhouette in top-right preview area inside canvas
  // small inset preview
  const px = W - 220, py = 20, pw = 200, ph = 160;
  ctx.save();
  ctx.translate(px, py);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0,0,pw,ph);
  // draw target shapes scaled to preview box
  const level = LEVELS[levelIndex];
  ctx.save();
  // center target content
  ctx.translate(20,20);
  level.target.forEach(t=>{
    ctx.fillStyle = '#ffffff';
    if(t.type==='rect'){
      ctx.beginPath(); ctx.roundRect(t.x - 360, t.y - 200, t.w, t.h, 6); ctx.fill();
    } else if(t.type==='circle'){
      ctx.beginPath(); ctx.arc(t.x - 360, t.y - 200, t.r, 0, Math.PI*2); ctx.fill();
    }
  });
  ctx.restore();
  // label
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '12px Inter, system-ui, -apple-system';
  ctx.fillText('Target silhouette', 8, ph + 15);
  ctx.restore();
}

// main render loop
function render(){
  clear();
  // shadow area
  renderShadows();
  // ambient light
  renderLight();
  // shapes on top
  renderObjects();
  // overlay target preview
  renderTargetSilhouette();

  // status: calculate match percent
  const pct = calcMatchPercent();
  $('matchPct').textContent = Math.round(pct) + '%';
  $('matchBar').value = pct;
  if(pct >= 92){
    // success!
    $('statusMsg').textContent = 'Matched!';
    if(soundEnabled()) { sfxWin.play().catch(()=>{}); }
  } else {
    $('statusMsg').textContent = 'Keep adjusting to match target';
  }
}

// ========== Silhouette matching ==========
function renderSilhouetteToTemp(drawTarget){
  // Draw scene's silhouette (shadows+objects) or target silhouette to an offscreen canvas, then compare
  const temp = document.createElement('canvas');
  temp.width = 240; temp.height = 160;
  const tctx = temp.getContext('2d');
  tctx.fillStyle = '#000'; tctx.fillRect(0,0,temp.width,temp.height);
  tctx.save();
  // scale & translate so target and scene align roughly
  tctx.scale(0.32, 0.32); // approximate mapping from main canvas
  tctx.translate(160, 40);
  if(drawTarget){
    const level = LEVELS[levelIndex];
    tctx.fillStyle = '#fff';
    level.target.forEach(t => {
      if(t.type === 'rect') {
        tctx.fillRect(t.x - 360, t.y - 200, t.w, t.h);
      } else if(t.type === 'circle'){
        tctx.beginPath(); tctx.arc(t.x - 360, t.y - 200, t.r, 0, Math.PI*2); tctx.fill();
      }
    });
  } else {
    // draw shadows and objects as white silhouette
    tctx.fillStyle = '#fff';
    // draw projected shadow polygons
    objects.forEach(o=>{
      let pts = [];
      if(o.type==='circle'){
        const seg = 12;
        for(let i=0;i<seg;i++){ const ang=(i/seg)*Math.PI*2; pts.push({x:o.x+Math.cos(ang)*o.r, y:o.y+Math.sin(ang)*o.r});}
      } else if(o.type==='rect') pts = rectPoints(o);
      else if(o.type==='triangle') pts = trianglePoints(o);
      const proj = projectPoints(pts, light, 8);
      tctx.beginPath();
      tctx.moveTo(pts[0].x, pts[0].y);
      for(let i=1;i<pts.length;i++) tctx.lineTo(pts[i].x, pts[i].y);
      for(let i=proj.length-1;i>=0;i--) tctx.lineTo(proj[i].x, proj[i].y);
      tctx.closePath(); tctx.fill();
    });
    // draw objects as filled (they also contribute)
    objects.forEach(o=>{
      if(o.type==='circle'){ tctx.beginPath(); tctx.arc(o.x, o.y, o.r, 0, Math.PI*2); tctx.fill(); }
      if(o.type==='rect'){ const pts = rectPoints(o); tctx.beginPath(); tctx.moveTo(pts[0].x,pts[0].y); pts.forEach((p)=>tctx.lineTo(p.x,p.y)); tctx.closePath(); tctx.fill(); }
      if(o.type==='triangle'){ const pts = trianglePoints(o); tctx.beginPath(); tctx.moveTo(pts[0].x,pts[0].y); pts.forEach((p)=>tctx.lineTo(p.x,p.y)); tctx.closePath(); tctx.fill(); }
    });
  }
  tctx.restore();
  return temp;
}

function calcMatchPercent(){
  const scene = renderSilhouetteToTemp(false);
  const target = renderSilhouetteToTemp(true);
  const sctx = scene.getContext('2d'), tctx = target.getContext('2d');
  const sdata = sctx.getImageData(0,0,scene.width, scene.height).data;
  const tdata = tctx.getImageData(0,0,target.width, target.height).data;
  let matchCount = 0, totalCount = 0;
  for(let i=0;i<sdata.length;i+=4){
    const sOn = sdata[i] > 120;
    const tOn = tdata[i] > 120;
    if(tOn) totalCount++;
    if(tOn && sOn) matchCount++;
  }
  if(totalCount === 0) return 0;
  return clamp((matchCount / totalCount) * 100, 0, 100);
}

// ========== Level management ==========
function loadLevel(idx){
  levelIndex = clamp(idx, 0, LEVELS.length - 1);
  const lvl = LEVELS[levelIndex];
  objects = deepClone(lvl.objects);
  // default light position
  light = { x: W*0.55, y: H*0.18, intensity: Math.min(W,H)*0.9, glow:1.0 };
  $('levelNum').textContent = levelIndex + 1;
  if(soundEnabled()) sfxClick.play().catch(()=>{});
  render();
}

$('restartBtn').addEventListener('click', () => { if(soundEnabled()) sfxClick.play().catch(()=>{}); loadLevel(levelIndex); });
$('resetObjectsBtn').addEventListener('click', () => { objects = deepClone(LEVELS[levelIndex].objects); if(soundEnabled()) sfxDrop.play().catch(()=>{}); render(); });
$('prevLevelBtn').addEventListener('click', ()=>{ loadLevel(levelIndex-1); });
$('nextLevelBtn').addEventListener('click', ()=>{ loadLevel(levelIndex+1); });

$('playPauseBtn').addEventListener('click', ()=> {
  paused = !paused;
  $('playPauseBtn').textContent = paused ? 'Resume' : 'Pause';
  if(paused) { ambience.pause(); } else { if(musicEnabled()) ambience.play().catch(()=>{}); }
});

// open hub button (if placed in hub)
$('openHub').addEventListener('click', ()=>{ window.history.back(); });

// UI tick (glow slider could be added later)
function gameTick(ts){
  if(paused) return;
  // gentle light pulsate
  light.glow = 0.9 + 0.15 * Math.sin(ts/600);
  render();
  lastRender = ts;
  requestAnimationFrame(gameTick);
}

// ========== Init ==========
function init(){
  // populate UI toggles initial
  if(musicEnabled()) ambience.play().catch(()=>{});
  loadLevel(0);
  requestAnimationFrame(gameTick);
}
init();

// Expose some internals in console for quick debugging
window.SHADOWPUZZLE = {LEVELS, loadLevel, objects, light, render};
