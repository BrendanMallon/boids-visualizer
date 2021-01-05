let width = 100;
let height = 100;

const sizeOfFlock = 1000;
const perceptionRange = 50;

var flock = [];

function spawn() {
  for (let i = 0; i < sizeOfFlock; i++) {
    // Random angle [0,2PI) for random unit vector generation
    let a = Math.random() * Math.PI;
    flock.push({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * Math.cos(a) * 2,
      dy: Math.random() * Math.sin(a) * 2,
      size: Math.floor(Math.random() * 6 + 1),
    });
  }
}

function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y)
  );
}

function isSeen(boid1, boid2, range) {
  return (
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y) <
      range * range && boid1.size == boid2.size
  );
}

/**
 * Returns nearby boids
 * @param boid
 * @param {number} range
 * @return {array} array of nearby boids
 */
function getNearbyBoids(boid, range) {
  temp = [];
  for (let i = 0; i < flock.length; i++) {
    if (boid != flock[i] && isSeen(boid, flock[i], range)) {
      temp.push(flock[i]);
    }
  }
  return temp;
}

function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

/**
 * Handles edge cases for input boid's position
 * @param boid
 */
function edges(boid) {
  if (boid.x < 0) {
    boid.x = width;
  } else if (boid.x > width) {
    boid.x = 0;
  }
  if (boid.y < 0) {
    boid.y = height;
  } else if (boid.y > height) {
    boid.y = 0;
  }
}

/**
 * Modifies the velocity of the input boid join the average position of nearby boids
 * @param boid
 */
function cohesion(boid) {
  const cohesionStrength = 0.01;

  let avgPosition = { x: 0, y: 0 };
  let nearbyBoids = getNearbyBoids(boid, perceptionRange);
  for (let other of nearbyBoids) {
    avgPosition.x += other.x;
    avgPosition.y += other.y;
  }

  if (nearbyBoids.length) {
    avgPosition.x /= nearbyBoids.length;
    avgPosition.y /= nearbyBoids.length;

    boid.dx += (avgPosition.x - boid.x) * cohesionStrength;
    boid.dy += (avgPosition.y - boid.y) * cohesionStrength;
  }
}

/**
 * Modifies the velocity of the input boid to seperate from nearby boids at half of the perceptionRange
 * @param boid
 */
function separate(boid) {
  const serparationStrength = 0.01;
  let sepVelocity = { dx: 0, dy: 0 };
  let nearbyBoids = getNearbyBoids(boid, perceptionRange * 0.5);
  for (let other of nearbyBoids) {
    sepVelocity.dx += boid.x - other.x;
    sepVelocity.dy += boid.y - other.y;
  }
  boid.dx += sepVelocity.dx * serparationStrength;
  boid.dy += sepVelocity.dy * serparationStrength;
}

/**
 * Modifies the velocity of the input boid to align with nearby boids
 * @param boid
 */
function align(boid) {
  const alignmentStrength = 0.04;

  let avgVelocity = { dx: 0, dy: 0 };
  let nearbyBoids = getNearbyBoids(boid, perceptionRange);
  for (let other of nearbyBoids) {
    avgVelocity.dx += other.dx;
    avgVelocity.dy += other.dy;
  }

  if (nearbyBoids.length > 0) {
    avgVelocity.dx /= nearbyBoids.length;
    avgVelocity.dy /= nearbyBoids.length;

    boid.dx += (avgVelocity.dx - boid.dx) * alignmentStrength;
    boid.dy += (avgVelocity.dy - boid.dy) * alignmentStrength;
  }
}

/**
 * Limits the speed of the input boid
 * @param boid
 */
function limitSpeed(boid) {
  const speedLimit = 5;
  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

/**
 *
 * @param ctx
 * @param boid
 */
function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);

  ctx.fillStyle = "#fff";
  let x = boid.x + boid.size;
  ctx.beginPath();
  ctx.moveTo(x, boid.y);
  ctx.lineTo(x - boid.size * 3, boid.y + boid.size);
  ctx.lineTo(x - boid.size * 3, boid.y - boid.size);
  ctx.lineTo(x, boid.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

var paused = false;
/**
 * Toggles pause
 */
function pause() {
  paused = !paused;
}

function animationLoop() {
  if (!paused) {
    for (let boid of flock) {
      // FLOCKING ALGORITHM
      cohesion(boid);
      separate(boid);
      align(boid);

      limitSpeed(boid);
      edges(boid);

      boid.x += boid.dx;
      boid.y += boid.dy;
    }
    const ctx = document.getElementById("boids").getContext("2d");
    ctx.clearRect(0, 0, width, height);
    for (let boid of flock) {
      drawBoid(ctx, boid);
    }
  }

  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  window.addEventListener("resize", sizeCanvas, false);
  window.addEventListener("click", pause, false);
  sizeCanvas();
  spawn();
  window.requestAnimationFrame(animationLoop);
};
