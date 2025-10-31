// Script.js (updated visuals, same core logic)
const canvas = document.getElementById('gamecanvas');
const ctx = canvas.getContext('2d');
const scoreelement = document.getElementById('score');
const gameoverelement = document.getElementById('gameover');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const gridWidth = Math.floor(canvas.width / gridSize);
const gridHeight = Math.floor(canvas.height / gridSize);

let snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
let food = { x: 5, y: 5 };
let direction = 'right';
let score = 0;
let gameRunning = true;

// interval handle so start button works
let gameInterval = null;

// Optional sound variables (kept but won't change existing files)
const backsound = new Audio('backsound.mp3');    // existing file (if present)
const gameoverSound = new Audio('gameover.mp3'); // existing file (if present)
backsound.loop = true;

// Images for background and food (use your image.png as food or background)
// If image files are missing the code will gracefully fallback to colored shapes.
const bgImage = new Image();
bgImage.src = 'image.png'; // you can replace with a suitable background file

const appleImage = new Image();
appleImage.src = 'image.png'; // reuse or replace with a dedicated apple sprite

// Utility: draw rounded rect / circle-like segment for snake
function drawSegment(x, y, size) {
  const cx = x * size + size / 2;
  const cy = y * size + size / 2;
  const radius = size * 0.45;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

// Draw the entire scene
function draw() {
  // Draw background (image if loaded, otherwise fallback color)
  if (bgImage.complete && bgImage.naturalWidth !== 0) {
    // draw background to fill canvas proportionally
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    // slightly dim overlay so snake/score remain visible
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = 'rgba(230, 225, 225, 0.36)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw snake body (green circles)
  ctx.fillStyle = '#2ecc71';
  snake.forEach(segment => {
    drawSegment(segment.x, segment.y, gridSize);
  });

  // Draw snake head a bit brighter
  const head = snake[0];
  if (head) {
    ctx.fillStyle = '#27ae60';
    drawSegment(head.x, head.y, gridSize);
  }

  // Draw food (use image if available, otherwise red square)
  if (appleImage.complete && appleImage.naturalWidth !== 0) {
    // draw apple centered inside grid cell
    const px = food.x * gridSize;
    const py = food.y * gridSize;
    const pad = gridSize * 0.08;
    ctx.drawImage(appleImage, px + pad, py + pad, gridSize - pad * 2, gridSize - pad * 2);
  } else {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  }

  // Draw score overlay (top-left)
  ctx.font = '18px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fillText('SCORE: ' + String(score).padStart(3, '0'), 12, 22);

  // Optional small hint for controls
  ctx.font = '12px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Use arrow keys to move', 12, canvas.height - 12);
}

// Game update logic (core kept intact)
function update() {
  if (!gameRunning) return;
  const head = { ...snake[0] };

  if (direction === 'up') head.y--;
  if (direction === 'down') head.y++;
  if (direction === 'left') head.x--;
  if (direction === 'right') head.x++;

  // Hit wall -> game over (preserve behavior)
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    endGame();
    return;
  }

  // Hit self -> game over
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      endGame();
      return;
    }
  }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (scoreelement) scoreelement.textContent = score;
    generateFood();
  } else {
    snake.pop();
  }
}

// Food generator (ensures not on snake)
function generateFood() {
  food = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight)
  };

  if (snake.some(s => s.x === food.x && s.y === food.y)) {
    generateFood();
  }
}

// End game (preserve original: show game over)
function endGame() {
  gameRunning = false;
  // stop the main interval to completely pause updates
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  // play game over sound if available (do not modify sound files)
  try {
    if (typeof gameoverSound !== 'undefined') {
      gameoverSound.currentTime = 0;
      gameoverSound.play().catch(() => {});
    }
    if (typeof backsound !== 'undefined') {
      backsound.pause();
    }
  } catch (e) {
    // ignore audio errors
  }

  if (gameoverelement) gameoverelement.style.display = 'block';
  // show start button again
  if (startBtn) startBtn.style.display = 'inline-block';
}

// Reset game to initial state
function resetGame() {
  snake = [{ x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) }];
  direction = 'right';
  score = 0;
  if (scoreelement) scoreelement.textContent = score;
  gameRunning = true;
  if (gameoverelement) gameoverelement.style.display = 'none';
  generateFood();
  draw();
}

// Start game (attached to start button in HTML)
function startGame() {
  // prevent multiple intervals
  if (gameInterval) clearInterval(gameInterval);

  resetGame();

  // attempt to play background music if present (won't break if file missing)
  try {
    if (typeof backsound !== 'undefined') {
      backsound.currentTime = 0;
      backsound.play().catch(() => {});
    }
  } catch (e) {}

  // hide start button while playing
  if (startBtn) startBtn.style.display = 'none';

  // set interval for game loop
  gameInterval = setInterval(gameLoop, 150);
}

// Keyboard controls (kept same)
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && direction !== 'down') direction = 'up';
  if (e.key === 'ArrowDown' && direction !== 'up') direction = 'down';
  if (e.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
  if (e.key === 'ArrowRight' && direction !== 'left') direction = 'right';
});

// Main loop
function gameLoop() {
  update();
  draw();
}

// Initialize: draw once and start an automatic loop (keeps backward compatibility)
resetGame();
if (!gameInterval) {
  // start automatically like previous version
  gameInterval = setInterval(gameLoop, 150);
}
