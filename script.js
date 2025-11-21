// ================= CANVAS =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================= PLAYER =================
let player = { 
  x: 80, y: 300, w: 35, h: 50,
  dx: 0, dy: 0, speed: 4, jump: -12,
  onGround: false,
  attacking: false
};

// ================= PLATFORM =================
const platforms = [
  { x: 0, y: 380, w: 800, h: 70 },
  { x: 200, y: 300, w: 140, h: 20 },
  { x: 430, y: 240, w: 160, h: 20 }
];

// ================= KEY =================
let key = { x: 480, y: 190, w: 25, h: 25, taken: false };

// ================= DOOR =================
let door = { x: 700, y: 330, w: 50, h: 70, open: false };

// ================= ENEMY =================
let enemy = {
    x: 260, y: 260, w: 35, h: 40,
    dir: 1, speed: 2,
    minX: 200, maxX: 360,
    dead: false
};

// ================= PHYSICS =================
const gravity = 0.6;

// ================= INPUT =================
const keysPressed = {};
document.addEventListener("keydown", (e) => keysPressed[e.key] = true);
document.addEventListener("keyup", (e) => keysPressed[e.key] = false);

// ================= ATTACK (tekan J) =================
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "j" && !player.attacking) {
    player.attacking = true;
    setTimeout(() => player.attacking = false, 300);
  }
});

// ================= GENERAL QUESTION =================
function askQuestion() {
    const q = [
        { t: "Planet terbesar di tata surya?", a: "jupiter" },
        { t: "Ibukota negara Indonesia?", a: "jakarta" },
        { t: "Hewan tercepat di darat?", a: "cheetah" },
        { t: "Berapa warna pada pelangi?", a: "7" },
        { t: "Lambang unsur O pada tabel periodik?", a: "oksigen" }
    ];
    const random = q[Math.floor(Math.random() * q.length)];
    const answer = prompt("Pertanyaan:\n" + random.t + "\n\nJawaban:");
    if (!answer) return false;
    return answer.trim().toLowerCase() === random.a;
}

// ================= GAME LOOP =================
function update() {

    // Gerakan kiri kanan
    if (keysPressed["ArrowLeft"] || keysPressed["a"]) player.dx = -player.speed;
    else if (keysPressed["ArrowRight"] || keysPressed["d"]) player.dx = player.speed;
    else player.dx = 0;

    // Lompat
    if ((keysPressed["ArrowUp"] || keysPressed["w"] || keysPressed[" "]) && player.onGround) {
        player.dy = player.jump;
        player.onGround = false;
    }

    // Fisika jatuh
    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    // Collision platform
    player.onGround = false;
    platforms.forEach(p => {
        if (player.x < p.x + p.w && player.x + player.w > p.x &&
            player.y < p.y + p.h && player.y + player.h > p.y && player.dy > 0) {
            player.y = p.y - player.h;
            player.dy = 0;
            player.onGround = true;
        }
    });

    // Ambil kunci
    if (!key.taken &&
        player.x < key.x + key.w && player.x + player.w > key.x &&
        player.y < key.y + key.h && player.y + player.h > key.y) {
        
        key.taken = true;
        let result = askQuestion();
        if (result) {
            door.open = true;
            alert("Jawaban BENAR! Pintu terbuka!");
        } else {
            alert("Jawaban SALAH! Ambil lagi kuncinya!");
            key.taken = false;
            key.x = 480;
            key.y = 190;
        }
    }

    // Musuh patrol
    if (!enemy.dead) {
        enemy.x += enemy.speed * enemy.dir;
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) enemy.dir *= -1;
    }

    // Musuh kena serangan
    if (!enemy.dead && player.attacking) {
        let atk = {
            x: player.x + (player.dx >= 0 ? player.w : -25),
            y: player.y,
            w: 25,
            h: player.h
        };
        if (atk.x < enemy.x + enemy.w && atk.x + atk.w > enemy.x &&
            atk.y < enemy.y + enemy.h && atk.y + atk.h > enemy.y) {
            enemy.dead = true;
            alert("🔥 Musuh dikalahkan!");
        }
    }

    // Player kena musuh
    if (!enemy.dead &&
        player.x < enemy.x + enemy.w && player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h && player.y + player.h > enemy.y) {
        alert("💀 Kamu terkena musuh! Game dimulai ulang!");
        location.reload();
    }

    // Menang
    if (door.open &&
        player.x < door.x + door.w && player.x + player.w > door.x &&
        player.y < door.y + door.h && player.y + player.h > door.y) {
        alert("🎉 Kamu menang!");
        location.reload();
    }

    draw();
    requestAnimationFrame(update);
}

// ================= DRAW =================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = "#654321";
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Player
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // Attack Effect
    if (player.attacking) {
        ctx.fillStyle = "rgba(255,0,0,0.6)";
        let atkX = player.x + (player.dx >= 0 ? player.w : -25);
        ctx.fillRect(atkX, player.y, 25, player.h);
    }

    // Key
    if (!key.taken) {
        ctx.fillStyle = "gold";
        ctx.fillRect(key.x, key.y, key.w, key.h);
    }

    // Door
    ctx.fillStyle = door.open ? "green" : "brown";
    ctx.fillRect(door.x, door.y, door.w, door.h);

    // Enemy
    if (!enemy.dead) {
        ctx.fillStyle = "purple";
        ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
    }
}

// START GAME
update();
