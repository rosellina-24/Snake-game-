const canvas = document.getElementById('gamecanvas');
const ctx = canvas.getContext('2d');
const scoreelement = document.getElementById('score');
const gameoverelement = document.getElementById('gameover');

const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

let snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
let food = { x: 5, y: 5 };
let direction = 'right';
let score = 0;
let gameRunning = false;
let gameInterval = null;

// --- EFEK SUARA DITAMBAHKAN ---
const backsound = new Audio('/game/audio/backsound.mp3'); 
backsound.loop = true;
backsound.volume = 0.7;

const gameoverSound = new Audio('/game/audio/gameover.mp3');
gameoverSound.volume = 0.7;

document.body.addEventListener('click', () => {
    if (backsound.paused) backsound.play().catch(e => console.error("Backsound blocked:", e));
}, { once: true });
// ----------------------------

function draw() {
  // Latar belakang kanvas, bisa disesuaikan jika ingin pattern atau gradasi di dalam kanvas
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Latar kanvas semi-transparan putih
  ctx.fillRect(0, 0, canvas.width, canvas.height); 

  // Gambar ular: Warna hijau cerah
  ctx.fillStyle = '#5cd1ff'; 
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  // Gambar makanan: Warna oranye cerah
  ctx.fillStyle = '#ec1438ff'; 
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function update() {
  if (!gameRunning) return;
  const head = { ...snake[0] };

  if (direction === 'up') head.y--;
  if (direction === 'down') head.y++;
  if (direction === 'left') head.x--;
  if (direction === 'right') head.x++;

  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    endGame();
    return;
  }

  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreelement.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight)
  };

  if (snake.some(s => s.x === food.x && s.y === food.y)) {
    generateFood();
  }
}

function endGame() {
  gameRunning = false;
  if (gameoverelement) gameoverelement.style.display = 'block';
  
  backsound.pause();
  gameoverSound.currentTime = 0;
  gameoverSound.play().catch(e => console.error("Game Over sound playback failed:", e));

  if (gameInterval) clearInterval(gameInterval); 
  document.getElementById('startBtn').style.display = 'inline-block';
}

function resetGame() {
  if (gameInterval) clearInterval(gameInterval);

  snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  direction = 'right';
  score = 0;
  scoreelement.textContent = score;
  gameRunning = true; 
  if (gameoverelement) gameoverelement.style.display = 'none';
  
  generateFood();
  draw(); 

  gameInterval = setInterval(gameLoop, 150);
  document.getElementById('startBtn').style.display = 'none';
  
  backsound.currentTime = 0;
  backsound.play().catch(e => console.error("Backsound play failed on restart:", e));
}

function startGame() {
    resetGame(); 
}

document.addEventListener('keydown', (e) => {
  if (!gameRunning) return; 
  if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
  if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
  if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
});

function gameLoop() {
  update();
  draw();
}

resetGame();
gameRunning = false;
document.getElementById('startBtn').style.display = 'inline-block';
if (gameInterval) clearInterval(gameInterval);