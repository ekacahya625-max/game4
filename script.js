const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Audio
const bgm = document.getElementById("bgm");
const swordSfx = document.getElementById("swordSfx");
const enemyHitSfx = document.getElementById("enemyHitSfx");
bgm.volume = 0.5;
bgm.play();

// Pedang image
const swordImg = new Image();
swordImg.src = "sword.png";

// Player
let player = {
    x: 80, y: 300, w: 35, h: 50,
    dx: 0, dy: 0, speed: 4, jump: -12,
    onGround: false, attacking: false, facingRight: true
};

// Enemy
let enemy = {
    x: 260, y: 260, w: 35, h: 40,
    dir: 1, speed: 2, minX: 200, maxX: 360,
    dead: false
};

// Key input
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Attack — J
document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "j" && !player.attacking) {
      player.attacking = true;
      swordSfx.currentTime = 0;
      swordSfx.play();
      setTimeout(() => player.attacking = false, 300);
  }
});

function update() {
    // Movement
    if (keys["ArrowRight"] || keys["d"]) { player.dx = player.speed; player.facingRight = true; }
    else if (keys["ArrowLeft"] || keys["a"]) { player.dx = -player.speed; player.facingRight = false; }
    else player.dx = 0;

    if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && player.onGround) {
        player.dy = player.jump;
    }

    player.dy += 0.5;
    player.x += player.dx;
    player.y += player.dy;

    // Floor
    if (player.y + player.h >= 470) {
        player.y = 470 - player.h;
        player.onGround = true;
        player.dy = 0;
    } else player.onGround = false;

    // Enemy walking (patrol)
    if (!enemy.dead) {
        enemy.x += enemy.dir * enemy.speed;
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) enemy.dir *= -1;
    }

    // Attack enemy
    if (!enemy.dead && player.attacking) {
        let swordX = player.facingRight ? player.x + player.w : player.x - 30;
        let swordY = player.y;

        if (swordX < enemy.x + enemy.w && swordX + 30 > enemy.x &&
            swordY < enemy.y + enemy.h && swordY + player.h > enemy.y) {
            enemy.dead = true;
            enemyHitSfx.currentTime = 0;
            enemyHitSfx.play();
        }
    }

    // Touch enemy (if alive)
    if (!enemy.dead && player.x < enemy.x + enemy.w && player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h && player.y + player.h > enemy.y) {
        alert("💀 Kamu tersentuh musuh!");
        location.reload();
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#4b8b1e";
    ctx.fillRect(0, 470, canvas.width, 50);

    // Player
    ctx.fillStyle = "#4444ff";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Sword sprite visible only when attacking
    if (player.attacking) {
        let sx = player.facingRight ? player.x + player.w : player.x - 30;
        ctx.drawImage(swordImg, sx, player.y + 5, 30, 30);
    }

    // Enemy
    if (!enemy.dead) {
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    }
}

update();
