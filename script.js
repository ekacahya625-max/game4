const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let keys = {};
let gameOver = false;
let win = false;

const player = {
  x: 80, y: H - 140, w: 36, h: 48,
  vx: 0, vy: 0,
  speed: 3.2,
  jumpPower: 10.5,
  grounded: false,
  color: '#f0b400'
};

const gravity = 0.5;
const friction = 0.85;

const platforms = [
  {x:0, y:H-24, w:W, h:24},
  {x:40, y:H-140, w:220, h:24},
  {x:320, y:H-220, w:260, h:24},
  {x:680, y:H-300, w:200, h:24},
  {x:560, y:H-120, w:120, h:24},
  {x:220, y:H-80, w:100, h:24}
];

const key = { x:720, y:H-340, r:10, collected:false, color:'#ffd700' };

const door = {
  x: 860, y: H - 88 - 64, w:48, h:64,
  opened:false,
  colorClosed:'#7b3f3f',
  colorOpen:'#6fbf73'
};

const enemy = {
  x:360, y:H - 244 - 36, w:36, h:36,
  vx:1.6, leftBound:320, rightBound:560,
  color:'#c14444'
};

window.addEventListener('keydown', (e)=>{ keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e)=>{ keys[e.key.toLowerCase()] = false; });

function rectsOverlap(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updatePlayer(){
  let moving = false;
  if (keys['arrowleft'] || keys['a']){ player.vx = Math.max(player.vx - 0.6, -player.speed); moving = true; }
  if (keys['arrowright'] || keys['d']){ player.vx = Math.min(player.vx + 0.6, player.speed); moving = true; }
  if (!moving) player.vx *= friction;

  if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.grounded){
    player.vy = -player.jumpPower;
    player.grounded = false;
  }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;
  if (player.y > H) resetPlayer();

  player.grounded = false;
  for (let p of platforms){
    if (player.x + player.w > p.x && player.x < p.x + p.w){
      if (player.y + player.h > p.y && player.y + player.h - player.vy <= p.y){
        player.y = p.y - player.h; player.vy = 0; player.grounded = true;
      }
      if (player.y < p.y + p.h && player.y - player.vy >= p.y + p.h){
        player.y = p.y + p.h; player.vy = 0.5;
      }
    }
  }
}

function resetPlayer(){
  player.x = 80; player.y = H - 140; player.vx = 0; player.vy = 0;
}

function updateEnemy(){
  enemy.x += enemy.vx;
  if (enemy.x < enemy.leftBound){ enemy.x = enemy.leftBound; enemy.vx *= -1; }
  if (enemy.x + enemy.w > enemy.rightBound){ enemy.x = enemy.rightBound - enemy.w; enemy.vx *= -1; }
}

function checkKey(){
  if (!key.collected){
    const pk = {x:key.x - key.r, y:key.y - key.r, w:key.r*2, h:key.r*2};
    const pl = {x:player.x, y:player.y, w:player.w, h:player.h};
    if (rectsOverlap(pk,pl)) key.collected = true;
  }
}

function checkDoor(){
  const dr = {x:door.x, y:door.y, w:door.w, h:door.h};
  const pl = {x:player.x, y:player.y, w:player.w, h:player.h};
  if (rectsOverlap(dr,pl)){
    if (key.collected) win = true;
    else if (player.x + player.w/2 < door.x + door.w/2) player.x = door.x - player.w - 1;
    else player.x = door.x + door.w + 1;
  }
}

function checkEnemyCollision(){
  const en = {x:enemy.x, y:enemy.y, w:enemy.w, h:enemy.h};
  const pl = {x:player.x, y:player.y, w:player.w, h:player.h};
  if (rectsOverlap(en,pl)){
    if (player.vy > 1){
      enemy.x = -9999; enemy.vx = 0;
      player.vy = -6;
    } else {
      resetPlayer();
      key.collected = false;
    }
  }
}

function update(){
  if (gameOver || win) return;
  updatePlayer();
  updateEnemy();
  checkKey();
  checkDoor();
  checkEnemyCollision();
}

function drawRoundedRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  ctx.fill();
}

function draw(){
  ctx.clearRect(0,0,W,H);

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i=0;i<6;i++){
    const cx = 80 + i*140;
    const cy = 60 + (i%2)*40;
    ctx.beginPath();
    ctx.ellipse(cx,cy,50,28,0,0,Math.PI*2);
    ctx.ellipse(cx+34,cy-8,36,22,0,0,Math.PI*2);
    ctx.fill();
  }

  ctx.fillStyle = '#6b3f42';
  for (let p of platforms){
    drawRoundedRect(p.x,p.y,p.w,p.h,6);
  }

  if (!key.collected){
    ctx.fillStyle = key.color;
    ctx.beginPath();
    ctx.arc(key.x,key.y,key.r,0,Math.PI*2);
    ctx.fill();
    ctx.fillRect(key.x+6,key.y-2,8,6);
  }

  ctx.fillStyle = key.collected ? door.colorOpen : door.colorClosed;
  drawRoundedRect(door.x,door.y,door.w,door.h,4);
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(door.x+10,door.y+door.h/2,4,0,Math.PI*2); ctx.fill();

  if (enemy.x > -100){
    ctx.fillStyle = enemy.color;
    drawRoundedRect(enemy.x,enemy.y,enemy.w,enemy.h,6);
    ctx.fillStyle = '#fff'; ctx.fillRect(enemy.x+6, enemy.y+8, 6,6);
    ctx.fillRect(enemy.x+20, enemy.y+8, 6,6);
    ctx.fillStyle = '#000'; ctx.fillRect(enemy.x+8, enemy.y+10, 2,2);
    ctx.fillRect(enemy.x+22, enemy.y+10, 2,2);
  }

  ctx.fillStyle = player.color;
  drawRoundedRect(player.x,player.y,player.w,player.h,6);
  ctx.fillStyle = '#222'; ctx.fillRect(player.x+8,player.y+12,6,6);

  ctx.fillStyle = '#222';
  ctx.font = '16px sans-serif';
  ctx.fillText('Key: ' + (key.collected ? 'Yes' : 'No'), 12, 22);

  if (win){
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#fff'; ctx.font='36px sans-serif';
    ctx.fillText('KAMU MENANG! (Tekan R untuk ulang)', 120, H/2);
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

window.addEventListener('keydown', (e)=>{
  if (e.key.toLowerCase() === 'r'){
    key.collected = false; win = false;
    enemy.x = 360; enemy.vx = 1.6;
    resetPlayer();
  }
});
