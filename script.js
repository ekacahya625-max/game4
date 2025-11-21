// ================= CANVAS =================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================ PLAYER ====================
let player = { x: 80, y: 300, w: 35, h: 50, dx: 0, dy: 0, speed: 4, jump: -12, onGround: false };

// ================ PLATFORM ==================
const platforms = [
  { x: 0, y: 380, w: 800, h: 70 },
  { x: 200, y: 300, w: 140, h: 20 },
  { x: 430, y: 240, w: 160, h: 20 }
];

// ================ KEY ==================
let key = { x: 480, y: 190, w: 25, h: 25, taken: false };

// ================ DOOR ==================
let door = { x: 700, y: 330, w: 50, h: 70, open: false };

// ================ PHYSICS ==================
const gravity = 0.6;

// ================= INPUT =================
const keysPressed = {};
document.addEventListener("keydown", (e) => keysPressed[e.key] = true);
document.addEventListener("keyup", (e) => keysPressed[e.key] = false);

// ================= QUESTION =================
function askQuestion() {
    const q = [
        { t: "Planet terbesar di tata surya?", a: "jupiter" },
        { t: "Ibukota negara Indonesia?", a: "jakarta" },
        { t: "Hewan tercepat di darat?", a: "cheetah" },
        { t: "Berapa warna pada pelangi?", a: "7" },
        { t: "Lambang unsur O pada tabel periodik adalah?", a: "oksigen" }
    ];

    const random = q[Math.floor(Math.random() * q.length)];
    const answer = prompt("Pertanyaan:\n" + random.t + "\n\nJawaban:");

    if (!answer) return false;
    return answer.trim().toLowerCase() === random.a;
}

// ================= GAME LOOP =================
function update() {
    // Movement
    if (keysPressed["ArrowLeft"] || keysPressed["a"]) player.dx = -player.speed;
    else if (keysPressed["ArrowRight"] || keysPressed["d"]) player.dx = player.speed;
    else player.dx = 0;

    if ((keysPressed["ArrowUp"] || keysPressed["w"] || keysPressed[" "]) && player.onGround) {
        player.dy = player.jump;
        player.onGround = false;
    }

    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    // Collision with platforms
    player.onGround = false;
    platforms.forEach(p => {
        if (player.x < p.x + p.w && player.x + player.w > p.x &&
            player.y < p.y + p.h && player.y + player.h > p.y && player.dy > 0) {
            player.y = p.y - player.h;
            player.dy = 0;
            player.onGround = true;
        }
    });

    // Take key = question
    if (!key.taken &&
        player.x < key.x + key.w && player.x + player.w > key.x &&
        player.y < key.y + key.h && player.y + player.h > key.y) {

        key.taken = true;
        let result = askQuestion();

        if (result) {
            door.open = true;
            alert("Jawaban BENAR! Pintu terbuka!");
        } else {
            alert("Jawaban SALAH! Coba lagi ya!");
            key.taken = false; // key appears again
            key.x = 480;
            key.y = 190;
        }
    }

    // Win detection
    if (door.open &&
        player.x < door.x + door.w && player.x + player.w > door.x &&
        player.y < door.y + door.h && player.y + player.h > door.y) {

        alert("🎉 SELAMAT! Kamu berhasil!");
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

    // Key
    if (!key.taken) {
        ctx.fillStyle = "gold";
        ctx.fillRect(key.x, key.y, key.w, key.h);
    }

    // Door
    ctx.fillStyle = door.open ? "green" : "brown";
    ctx.fillRect(door.x, door.y, door.w, door.h);
}

// START
update();
