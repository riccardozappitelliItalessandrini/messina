// Alcuni commenti potrebbero essere in inglese per abitudine
// non mi giudichi, crazie
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const red_ship_image = new Image();
red_ship_image.src = "assets/sprites/red.png";

const blue_ship_image = new Image();
blue_ship_image.src = "assets/sprites/blue.png";

const bomb_image = new Image();
bomb_image.src = "assets/sprites/bomb.png"

const cure_image = new Image();
cure_image.src = "assets/sprites/cure.png"

const faster_bullet_image = new Image();
faster_bullet_image.src = "assets/sprites/faster_bullet.png"

const background_image = new Image();
background_image.src = "assets/sprites/space.jpeg";

const shooting_sound = new Audio("assets/sfx/laser.mp3");
const gameoversound = new Audio("assets/sfx/gameover.mp3");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const midLine = canvas.width / 2;
}
resizeCanvas()

let gameOver = false;
let winnerText = "";
const midLine = canvas.width / 2;

let keys = {};
let bullets = [];
let powers = [];

let lastPowerSpawn = 0;

window.addEventListener("resize", resizeCanvas);
document.addEventListener("fullscreenchange", resizeCanvas);
//controllo se la finestra viene ridimensionata o messa in fullscreen

// Input handling
window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === "r" && gameOver) {
        resetGame();
    }
});

window.addEventListener("keyup", e => {
  k = e.key.toLowerCase();
  keys[k] = false;
  if (k == "f") {
    keys["f_"] = false;
  }
  if (k == "ò") {
    keys["ò_"] = false;
  }
});

// Players
const player1 = {
  x: midLine / 2,
  y: canvas.height / 2,
  radius: 30,
  speed: 4,
  color: "red",
  hp: 100,
  maxHp: 100,
  bulletSpeed: 6,
  shootCooldown: 400,
  lastShot: 0,
  activeEffects: [],
};

const player2 = {
  x: midLine + midLine / 2,
  y: canvas.height / 2,
  radius: 30,
  speed: 4,
  color: "cyan",
  hp: 100,
  maxHp: 100,
  bulletSpeed: 6,
  shootCooldown: 400,
  lastShot: 0,
  activeEffects: [],
};

function shoot(player, direction) {
  const now = Date.now();
  if (now - player.lastShot < player.shootCooldown) return;

  player.lastShot = now;
  shooting_sound.currentTime = 0;
  shooting_sound.play();

  bullets.push({
    x: player.x,
    y: player.y,
    dx: direction * (player.bulletSpeed / 6),
    dy: 0,
    radius: 5,
    owner: player
  });
}

class Power {
  constructor(x, y, type, image) {
    this.x = x;
    this.y = y;
    this.radius = 20; // slightly bigger for sprites
    this.type = type;
    this.image = image;
  }

  apply(player) {
    if (this.type === "heal") {
      player.hp += 20;
      if (player.hp > 100) player.hp = 100;
    }

    if (this.type === "damage") {
      player.hp -= Math.random() * 10 + 10; //numero casuale tra 10 e 20 in teoria
      if (player.hp < 0) player.hp = 0;
    }

  if (this.type === "speed") {
    player.bulletSpeed = 30;

    const effect = {
      type: "speed",
      image: this.image,
      endTime: Date.now() + 5000,
    };

    player.activeEffects.push(effect);

    setTimeout(() => {
      player.bulletSpeed = 6;
      player.activeEffects = player.activeEffects.filter(e => e !== effect);
    }, 5000);
  }
  }
}

function drawHealthBar(x, y, width, height, currentHP, maxHP, color) {
    ctx.fillStyle = "black";
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

    ctx.fillStyle = "transparent";
    ctx.fillRect(x, y, width, height);

    const healthWidth = (currentHP / maxHP) * width;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, healthWidth, height);
}

function drawKeyOverlay() {
  const keySize = 40;
  const gap = 10;

  function drawKey(label, x, y, active, active_color = "lime") {
    ctx.fillStyle = active ? active_color : "rgba(255,255,255,0.2)";
    ctx.fillRect(x, y, keySize, keySize);

    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, keySize, keySize);

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label.toUpperCase(), x + keySize / 2, y + keySize / 2);
  }

  const baseX1 = 40;
  const baseY1 = canvas.height - 120;

  drawKey("w", baseX1 + keySize + gap, baseY1, keys["w"]);
  drawKey("f", baseX1, baseY1, keys["f_"], active_color="red");
  drawKey("a", baseX1, baseY1 + keySize + gap, keys["a"]);
  drawKey("s", baseX1 + keySize + gap, baseY1 + keySize + gap, keys["s"]);
  drawKey("d", baseX1 + 2*(keySize + gap), baseY1 + keySize + gap, keys["d"]);

  const baseX2 = canvas.width - 160;
  const baseY2 = canvas.height - 120;

  drawKey("i", baseX2 + keySize + gap, baseY2, keys["i"]);
  drawKey("ò", baseX2 + 2*(keySize + gap), baseY2, keys["ò_"], active_color="blue");
  drawKey("j", baseX2, baseY2 + keySize + gap, keys["j"]);
  drawKey("k", baseX2 + keySize + gap, baseY2 + keySize + gap, keys["k"]);
  drawKey("l", baseX2 + 2*(keySize + gap), baseY2 + keySize + gap, keys["l"]);

  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

// random spawn di poteri
function drawActiveEffects(player) {
  const iconSize = 30;
  const spacing = 10;

  player.activeEffects.forEach((effect, index) => {
    const timeLeft = Math.max(0, effect.endTime - Date.now());
    const seconds = (timeLeft / 1000).toFixed(1);

    const x = player.x - iconSize / 2;
    const y = player.y - 60 - index * (iconSize + spacing);

    ctx.drawImage(effect.image, x, y, iconSize, iconSize);

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(seconds, player.x, y - 5);
  });

  ctx.textAlign = "start";
}

function spawnPower() {
  const side = Math.random() < 0.5 ? 0 : 1;

  let x;
  if (side === 0) {
    x = Math.random() * (midLine - 40) + 20;
  } else {
    x = Math.random() * (canvas.width - midLine - 40) + midLine + 20;
  }

  const y = Math.random() * (canvas.height - 40) + 20;

  const rand = Math.random();
  let power;

  if (rand < 0.33) {
    power = new Power(x, y, "heal", cure_image);
  } else if (rand < 0.66) {
    power = new Power(x, y, "damage", bomb_image);
  } else {
    power = new Power(x, y, "speed", faster_bullet_image);
  }

  powers.push(power);
}

function drawLegend() {
  const padding = 100;
  const iconSize = 40;
  const y = 10;

  const legend = [
    { image: cure_image, text: "+20 HP" },
    { image: bomb_image, text: "-20 HP" },
    { image: faster_bullet_image, text: "Faster bullets" }
  ];

  const totalWidth = legend.length * iconSize + (legend.length - 1) * padding;
  const startX = canvas.width / 2 - totalWidth / 2;

  const textHeight = 20;
  const rectPadding = 15;

  const rectWidth = (totalWidth + rectPadding * 2)+40;
  const rectHeight = iconSize + textHeight + rectPadding * 2;

  const rectX = startX - rectPadding-20;
  const rectY = y - rectPadding;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  //round rect with corner radius 15
  ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 15);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";

  legend.forEach((item, i) => {
    const x = startX + i * (iconSize + padding);

    if (item.image.complete) {
      ctx.drawImage(item.image, x, y, iconSize, iconSize);
    }

    ctx.fillText(item.text, x + iconSize / 2, y + iconSize + 4);
  });
}

function resetGame() {
  player1.hp = 100;
  player2.hp = 100;

  player1.bulletSpeed = 6;
  player2.bulletSpeed = 6;

  player1.x = midLine / 2;
  player1.y = canvas.height / 2;

  player2.x = midLine + midLine / 2;
  player2.y = canvas.height / 2;

  bullets = [];
  powers = [];
  gameOver = false;
}

function update() {
    if (gameOver) return;

    if (keys["w"]) player1.y -= player1.speed;
    if (keys["s"]) player1.y += player1.speed;
    if (keys["a"]) player1.x -= player1.speed;
    if (keys["d"]) player1.x += player1.speed;

    if (keys["f"]) {
        shoot(player1, 6);
        keys["f"] = false;
        keys["f_"] = true; //questo è per evidenziare
    }

    if (keys["i"] || keys["arrowup"]) player2.y -= player2.speed;
    if (keys["k"] || keys["arrowdown"]) player2.y += player2.speed;
    if (keys["j"] || keys["arrowleft"]) player2.x -= player2.speed;
    if (keys["l"] || keys["arrowright"]) player2.x += player2.speed;

    if (keys["ò"]) {
        shoot(player2, -6);
        keys["ò"] = false;
        keys["ò_"] = true; //questo è per evidenziare
    }

    bullets.forEach((b, index) => {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x < 0 || b.x > canvas.width) {
            bullets.splice(index, 1);
        }

        let target = b.owner === player1 ? player2 : player1;
        const dist = Math.hypot(b.x - target.x, b.y - target.y);

        if (dist < b.radius + target.radius) {
            target.hp -= 10;
            bullets.splice(index, 1);
        }
    });

    // power pickup logic
    powers.forEach((p, index) => {
        [player1, player2].forEach(player => {
            const dist = Math.hypot(p.x - player.x, p.y - player.y);
            if (dist < p.radius + player.radius) {
                p.apply(player);
                powers.splice(index, 1);
            }
        });
    });

    if (Date.now() - lastPowerSpawn > 5000) {
        spawnPower();
        lastPowerSpawn = Date.now();
    }

    constrainPlayer1();
    constrainPlayer2();

    if (!gameOver) {
        if (player1.hp <= 0) {
            gameOver = true;
            winnerText = "CYAN WINS";
        }

        if (player2.hp <= 0) {
            gameOver = true;
            winnerText = "RED WINS";
        }
    }
}

function constrainPlayer1() {
    if (player1.x - player1.radius < 0)
        player1.x = player1.radius;

    if (player1.y - player1.radius < 0)
        player1.y = player1.radius;

    if (player1.y + player1.radius > canvas.height)
        player1.y = canvas.height - player1.radius;

    if (player1.x + player1.radius > midLine)
        player1.x = midLine - player1.radius;
}

function constrainPlayer2() {
  if (player2.x + player2.radius > canvas.width)
    player2.x = canvas.width - player2.radius;

  if (player2.y - player2.radius < 0)
    player2.y = player2.radius;

  if (player2.y + player2.radius > canvas.height)
    player2.y = canvas.height - player2.radius;

  if (player2.x - player2.radius < midLine)
    player2.x = midLine + player2.radius;
}

function draw() {
  if (background_image.complete) {
    ctx.drawImage(
      background_image,
      0,
      0,
      canvas.width,
      canvas.height
    );
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(midLine, 0);
  ctx.lineTo(midLine, canvas.height);
  ctx.stroke();

  // draw powers
  powers.forEach(p => {
    const size = p.radius * 2;

    if (p.image && p.image.complete) {
      ctx.drawImage(
        p.image,
        p.x - p.radius,
        p.y - p.radius,
        size,
        size
      );
    }
  });

  bullets.forEach(b => {
    // le piace l'operatore ternario?
    ctx.fillStyle = b.owner == player1 ? "red" : "blue";
    // bene perché a me nemmeno

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  const size = player1.radius * 2;
  drawLegend();
  drawActiveEffects(player1);
  drawActiveEffects(player2);
  drawKeyOverlay();

  ctx.drawImage(
    red_ship_image,
    player1.x - player1.radius,
    player1.y - player1.radius,
    size,
    size
  );

  ctx.drawImage(
    blue_ship_image,
    player2.x - player2.radius,
    player2.y - player2.radius,
    size,
    size
  );

  ctx.fillStyle = "white";
  drawHealthBar(
    20, 
    20, 
    200, 
    20, 
    player1.hp, 
    player1.maxHp, 
    "red"
  );
  drawHealthBar(
    canvas.width - 220,
    20,
    200, 
    20, 
    player2.hp, 
    player2.maxHp, 
    "blue"
  );

if (gameOver) {
  gameoversound.play();
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "60px Arial";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

  ctx.font = "40px Arial";
  ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2);

  ctx.font = "20px Arial";
  ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 50);

  ctx.textAlign = "start";
}
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
