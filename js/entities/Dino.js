import { CONFIG } from '../config.js';

/**
 * Dino entity.
 * Responsible only for its own physics, state, and drawing.
 */
export class Dino {
  constructor() {
    this.reset();
  }

  reset() {
    const { DINO, GROUND_Y } = CONFIG;
    this.x = DINO.X;
    this.y = GROUND_Y - DINO.HEIGHT;
    this.width = DINO.WIDTH;
    this.height = DINO.HEIGHT;
    this.vy = 0;               // vertical velocity
    this.isOnGround = true;
    this.isDucking = false;
    this.isDead = false;

    // Sprite animation
    this._frameCount = 0;
    this._runFrame = 0;        // 0 or 1 for running animation
    this._blinkTimer = 0;
    this._blinkOpen = true;
  }

  jump() {
    if (!this.isOnGround || this.isDead) return;
    this.vy = this.isDucking ? CONFIG.DUCK_JUMP_VELOCITY : CONFIG.JUMP_VELOCITY;
    this.isOnGround = false;
    this.isDucking = false;
    this._syncSize();
  }

  duck(active) {
    if (this.isDead) return;
    if (!this.isOnGround) {
      // Cancel jump when ducking mid-air
      if (active && this.vy < 0) this.vy = 0;
      return;
    }
    this.isDucking = active;
    this._syncSize();
  }

  /** Align hitbox size with current pose */
  _syncSize() {
    const { DINO } = CONFIG;
    this.height = this.isDucking ? DINO.DUCK_HEIGHT : DINO.HEIGHT;
    this.y = CONFIG.GROUND_Y - this.height;
  }

  update() {
    if (this.isDead) return;

    const { DINO, GROUND_Y, GRAVITY } = CONFIG;

    // Physics
    if (!this.isOnGround) {
      this.vy += GRAVITY;
      this.y += this.vy;

      const groundY = GROUND_Y - this.height;
      if (this.y >= groundY) {
        this.y = groundY;
        this.vy = 0;
        this.isOnGround = true;
      }
    }

    // Animate running legs
    this._frameCount++;
    if (this._frameCount >= DINO.SPRITE_FRAME_INTERVAL) {
      this._frameCount = 0;
      this._runFrame = (this._runFrame + 1) % DINO.SPRITE_RUN_FRAMES;
    }

    // Blink animation (idle / in-air)
    this._blinkTimer++;
    if (this._blinkTimer > 60) {
      this._blinkOpen = !this._blinkOpen;
      this._blinkTimer = this._blinkOpen ? 0 : -Math.floor(Math.random() * 30);
    }
  }

  /**
   * Draw the dino using canvas 2D primitives (no sprite sheet required).
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} isNight
   */
  draw(ctx, isNight) {
    const color = isNight ? '#eeeeee' : '#535353';
    ctx.fillStyle = color;

    if (this.isDead) {
      this._drawDead(ctx, color);
    } else if (this.isDucking) {
      this._drawDucking(ctx, color);
    } else {
      this._drawRunning(ctx, color);
    }
  }

  _drawBody(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
  }

  _drawRunning(ctx, color) {
    const { x, y } = this;

    // Body
    this._drawBody(ctx, x + 2, y + 4, 36, 32, color);

    // Head
    this._drawBody(ctx, x + 14, y - 10, 28, 20, color);

    // Mouth / jaw
    ctx.fillStyle = '#f7f7f7';
    this._drawBody(ctx, x + 14, y + 4, 28, 8, '#f7f7f7');

    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.beginPath();
    ctx.arc(x + 36, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    if (this._blinkOpen) {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x + 37, y - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs (alternating)
    ctx.fillStyle = color;
    if (this.isOnGround) {
      const leg1Y = y + 36;
      const leg2Y = y + 36;
      if (this._runFrame === 0) {
        ctx.fillRect(x + 6, leg1Y, 8, 12);
        ctx.fillRect(x + 22, leg2Y - 6, 8, 6);
      } else {
        ctx.fillRect(x + 6, leg1Y - 6, 8, 6);
        ctx.fillRect(x + 22, leg2Y, 8, 12);
      }
    } else {
      // Both legs out when jumping
      ctx.fillRect(x + 6, y + 30, 8, 12);
      ctx.fillRect(x + 22, y + 36, 8, 8);
    }

    // Tail
    ctx.fillRect(x - 8, y + 16, 12, 6);

    // Arm
    ctx.fillRect(x + 30, y + 16, 12, 5);
  }

  _drawDucking(ctx, color) {
    const { x, y } = this;
    const h = CONFIG.DINO.DUCK_HEIGHT;

    // Body (low profile)
    this._drawBody(ctx, x + 2, y + 2, 48, h - 6, color);

    // Head forward
    this._drawBody(ctx, x + 28, y - 2, 22, 16, color);

    // Eye
    ctx.fillStyle = '#f7f7f7';
    ctx.beginPath();
    ctx.arc(x + 44, y + 3, 4, 0, Math.PI * 2);
    ctx.fill();
    if (this._blinkOpen) {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x + 45, y + 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = color;
    if (this._runFrame === 0) {
      ctx.fillRect(x + 8, y + h - 6, 10, 8);
      ctx.fillRect(x + 26, y + h - 10, 10, 4);
    } else {
      ctx.fillRect(x + 8, y + h - 10, 10, 4);
      ctx.fillRect(x + 26, y + h - 6, 10, 8);
    }

    // Tail
    ctx.fillRect(x - 8, y + 10, 12, 5);
  }

  _drawDead(ctx, color) {
    const { x, y } = this;

    // Body
    this._drawBody(ctx, x + 2, y + 4, 36, 32, color);

    // Head
    this._drawBody(ctx, x + 14, y - 10, 28, 20, color);

    // X eyes
    ctx.strokeStyle = '#f7f7f7';
    ctx.lineWidth = 2;
    const ex = x + 36, ey = y - 4;
    ctx.beginPath();
    ctx.moveTo(ex - 5, ey - 5); ctx.lineTo(ex + 5, ey + 5);
    ctx.moveTo(ex + 5, ey - 5); ctx.lineTo(ex - 5, ey + 5);
    ctx.stroke();

    // Legs splayed
    ctx.fillStyle = color;
    ctx.fillRect(x + 6, y + 36, 8, 12);
    ctx.fillRect(x + 22, y + 30, 8, 12);
    ctx.fillRect(x - 8, y + 16, 12, 6);
    ctx.fillRect(x + 30, y + 16, 12, 5);
  }

  /** Axis-aligned bounding box for collision */
  getBounds() {
    // Slightly inset for fairer collision
    return {
      x: this.x + 6,
      y: this.y + 4,
      width: this.width - 10,
      height: this.height - 6,
    };
  }
}
