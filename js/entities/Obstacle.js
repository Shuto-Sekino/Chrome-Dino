import { CONFIG } from '../config.js';

/**
 * Base class for all obstacles.
 * Subclasses implement draw() and define their hitbox shape.
 */
export class Obstacle {
  /**
   * @param {number} x - Initial x position (right edge of canvas)
   * @param {number} speed - Current game speed
   */
  constructor(x, speed) {
    this.x = x;
    this.speed = speed;
    this.offscreen = false;
  }

  update(speed) {
    this.x -= speed;
    if (this.x + this.width < 0) this.offscreen = true;
  }

  /** @returns {{ x, y, width, height }} */
  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  draw(_ctx, _isNight) {
    throw new Error('draw() must be implemented by subclass');
  }
}

// ---------------------------------------------------------------------------
// Cactus variants
// ---------------------------------------------------------------------------

const CACTUS_COLOR_DAY = '#2d4a2d';
const CACTUS_COLOR_NIGHT = '#4a8a4a';

/**
 * Single small cactus.
 */
export class SmallCactus extends Obstacle {
  constructor(x, speed) {
    super(x, speed);
    this.width = 17;
    this.height = 35;
    this.y = CONFIG.GROUND_Y - this.height;
  }

  draw(ctx, isNight) {
    const c = isNight ? CACTUS_COLOR_NIGHT : CACTUS_COLOR_DAY;
    ctx.fillStyle = c;
    const { x, y } = this;

    // Trunk
    ctx.fillRect(x + 6, y, 5, this.height);

    // Left arm
    ctx.fillRect(x, y + 10, 6, 5);
    ctx.fillRect(x, y + 6, 4, 10);

    // Right arm
    ctx.fillRect(x + 11, y + 14, 6, 5);
    ctx.fillRect(x + 13, y + 10, 4, 10);
  }
}

/**
 * Tall cactus (2 cacti side-by-side).
 */
export class LargeCactus extends Obstacle {
  constructor(x, speed) {
    super(x, speed);
    this.width = 25;
    this.height = 50;
    this.y = CONFIG.GROUND_Y - this.height;
  }

  draw(ctx, isNight) {
    const c = isNight ? CACTUS_COLOR_NIGHT : CACTUS_COLOR_DAY;
    ctx.fillStyle = c;
    const { x, y } = this;

    // Trunk
    ctx.fillRect(x + 8, y, 8, this.height);

    // Left arm
    ctx.fillRect(x, y + 14, 8, 7);
    ctx.fillRect(x, y + 8, 6, 14);

    // Right arm
    ctx.fillRect(x + 16, y + 20, 8, 7);
    ctx.fillRect(x + 18, y + 14, 6, 14);
  }
}

/**
 * Cluster of 3 small cacti.
 */
export class CactusCluster extends Obstacle {
  constructor(x, speed) {
    super(x, speed);
    this.width = 60;
    this.height = 35;
    this.y = CONFIG.GROUND_Y - this.height;
  }

  draw(ctx, isNight) {
    const c = isNight ? CACTUS_COLOR_NIGHT : CACTUS_COLOR_DAY;
    ctx.fillStyle = c;
    const { x, y } = this;

    for (const offsetX of [0, 22, 44]) {
      ctx.fillRect(x + offsetX + 6, y, 5, this.height);
      ctx.fillRect(x + offsetX, y + 10, 6, 5);
      ctx.fillRect(x + offsetX, y + 6, 4, 10);
      ctx.fillRect(x + offsetX + 11, y + 14, 6, 5);
      ctx.fillRect(x + offsetX + 13, y + 10, 4, 10);
    }
  }
}

// ---------------------------------------------------------------------------
// Pterodactyl
// ---------------------------------------------------------------------------

/**
 * Flying pterodactyl obstacle.
 * Wings animate up/down.
 */
export class Pterodactyl extends Obstacle {
  constructor(x, speed) {
    super(x, speed);
    this.width = 46;
    this.height = 34;

    // Pick a random flight height
    const heights = CONFIG.OBSTACLE.PTERODACTYL_HEIGHTS;
    this.y = heights[Math.floor(Math.random() * heights.length)];

    this._frame = 0;
    this._frameTimer = 0;
    this._wingsUp = true;
  }

  update(speed) {
    super.update(speed);
    this._frameTimer++;
    if (this._frameTimer >= 10) {
      this._frameTimer = 0;
      this._wingsUp = !this._wingsUp;
    }
  }

  draw(ctx, isNight) {
    const c = isNight ? '#aaddaa' : '#535353';
    ctx.fillStyle = c;
    const { x, y, _wingsUp } = this;

    // Body
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 20, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head / beak
    ctx.fillRect(x + 32, y + 14, 14, 6);
    ctx.fillRect(x + 44, y + 12, 6, 4);

    // Eye
    ctx.fillStyle = isNight ? '#1a1a2e' : '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 37, y + 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 37, y + 16, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = c;
    if (_wingsUp) {
      // Wings up
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 18);
      ctx.lineTo(x, y + 2);
      ctx.lineTo(x + 22, y + 14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 34, y + 18);
      ctx.lineTo(x + 46, y + 2);
      ctx.lineTo(x + 22, y + 14);
      ctx.closePath();
      ctx.fill();
    } else {
      // Wings down
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 20);
      ctx.lineTo(x, y + 34);
      ctx.lineTo(x + 22, y + 24);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 34, y + 20);
      ctx.lineTo(x + 46, y + 34);
      ctx.lineTo(x + 22, y + 24);
      ctx.closePath();
      ctx.fill();
    }

    // Tail
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 22);
    ctx.lineTo(x - 6, y + 18);
    ctx.lineTo(x - 6, y + 26);
    ctx.closePath();
    ctx.fill();
  }

  getBounds() {
    // Tighter hitbox (ignore wing tips)
    return {
      x: this.x + 4,
      y: this.y + 12,
      width: this.width - 8,
      height: 18,
    };
  }
}
