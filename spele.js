const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");

let started = false;

startBtn.onclick = function () {
  started = true;
  startBtn.style.display = "none";
  startSound.play();
  bgMusic.play();
};

let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});



const playerImg = new Image();
playerImg.src = "IMG/daniels.jpeg";

const enemyImg = new Image();
enemyImg.src = "IMG/sarkana.png";


const hitSound = new Audio("Sound/loose.wav");
const levelSound = new Audio("Sound/level.wav");
const startSound = new Audio("Sound/start.wav");

const bgMusic = new Audio("Sound/efn.wav");
bgMusic.loop = true;
bgMusic.volume = 0.2;


let level = 1;
let coins = 0;
let lives = 3;

let gameOver = false;
let inShop = false;

let levelStartTime = Date.now();
let shopStartTime = 0;



const player = {
  x: 400,
  y: 250,
  angle: 0,
  speed: 0,
  maxSpeed: 4,
  accel: 0.25
};



let enemies = [];

function spawnEnemies() {

  enemies = [];

  let count = 1;

  if (level >= 3) count = 2;
  if (level >= 5) count = 3;
  if (level >= 7) count = 4;

  for (let i = 0; i < count; i++) {

    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      angle: 0,
      speed: 2 + level * 0.3
    });

  }
}

spawnEnemies();



function update() {

  if (!started) return;
  if (gameOver) return;

  if (!inShop) {


    if (keys["ArrowUp"] || keys["w"]) player.speed += player.accel;
    if (keys["ArrowDown"] || keys["s"]) player.speed -= 0.2;
    if (keys["ArrowLeft"] || keys["a"]) player.angle -= 0.07;
    if (keys["ArrowRight"] || keys["d"]) player.angle += 0.07;

    player.speed *= 0.94;
    player.speed = Math.max(Math.min(player.speed, player.maxSpeed), -2);

    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    wrap(player);



    for (let e of enemies) {

      const dx = player.x - e.x;
      const dy = player.y - e.y;

      const targetAngle = Math.atan2(dy, dx);

      e.angle += (targetAngle - e.angle) * 0.07;

      e.x += Math.cos(e.angle) * e.speed;
      e.y += Math.sin(e.angle) * e.speed;

      wrap(e);


      if (Math.hypot(player.x - e.x, player.y - e.y) < 25) {

        hitSound.play();

        lives--;

        resetPositions();

        if (lives <= 0) gameOver = true;

        break;

      }
    }


    if ((Date.now() - levelStartTime) / 1000 > 15 + level * 2) {

      coins += 15 + level * 5;

      levelSound.play();

      inShop = true;

      shopStartTime = Date.now();

    }

  }

  else {


    if (keys["1"] && coins >= 20) {

      player.maxSpeed += 0.8;
      player.accel += 0.05;

      coins -= 20;

      keys["1"] = false;

    }

    if (keys["2"] && coins >= 30) {

      lives += 1;

      coins -= 30;

      keys["2"] = false;

    }


    if ((Date.now() - shopStartTime) / 1000 > 10) {

      level++;

      levelStartTime = Date.now();

      inShop = false;

      spawnEnemies();

    }

  }

}



function resetPositions() {

  player.x = 400;
  player.y = 250;
  player.speed = 0;

}



function wrap(o) {

  if (o.x < 0) o.x = canvas.width;
  if (o.x > canvas.width) o.x = 0;

  if (o.y < 0) o.y = canvas.height;
  if (o.y > canvas.height) o.y = 0;

}


function drawCar(x, y, angle, img) {

  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.drawImage(img, -25, -25, 50, 50);

  ctx.restore();

}



function drawBackground() {

  ctx.fillStyle = "#05070d";

  ctx.fillRect(0, 0, canvas.width, canvas.height);

}



function drawHUD() {

  ctx.fillStyle = "white";

  ctx.font = "18px Arial";

  ctx.fillText("Level: " + level, 20, 25);
  ctx.fillText("Coins: " + coins, 20, 50);
  ctx.fillText("Lives: " + lives, 20, 75);

  if (inShop) {

    ctx.fillStyle = "#00f0ff";

    ctx.font = "26px Arial";

    ctx.fillText("SHOP (10s)", 330, 80);

    ctx.font = "18px Arial";

    ctx.fillText("1 - Speed + (20 coins)", 250, 120);
    ctx.fillText("2 - +1 Life (30 coins)", 250, 150);

  }

  if (gameOver) {

    ctx.fillStyle = "#ff0044";

    ctx.font = "48px Arial";

    ctx.fillText("GAME OVER", 260, 250);

  }

}



function loop() {

  drawBackground();

  update();

  if (started) {

    drawCar(player.x, player.y, player.angle, playerImg);

    for (let e of enemies) {
      drawCar(e.x, e.y, e.angle, enemyImg);
    }

  }

  drawHUD();

  requestAnimationFrame(loop);

}

loop();