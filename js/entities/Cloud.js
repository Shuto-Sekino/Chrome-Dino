import { CONFIG } from '../config.js';

/**
 * A single cloud instance.
 */
class CloudInstance {
  constructor(x, y, scale) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.offscreen = false;
  }

  update(speed) {
    this.x -= speed * CONFIG.CLOUD.SPEED_RATIO;
    if (this.x + 80 * this.scale < 0) this.offscreen = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.beginPath();
    ctx.arc(30, 20, 18, 0, Math.PI * 2);
    ctx.arc(50, 14, 22, 0, Math.PI * 2);
    ctx.arc(70, 20, 16, 0, Math.PI * 2);
    ctx.rect(14, 20, 72, 18);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Manages spawning and updating of all clouds.
 */
export class CloudManager {
  constructor() {
    this._clouds = [];
    this._timer = 0;
  }

  reset() {
    this._clouds = [];
    this._timer = 0;
  }

  update(speed) {
    this._timer++;
    if (this._timer >= CONFIG.CLOUD.SPAWN_INTERVAL) {
      this._timer = 0;
      const y = CONFIG.CLOUD.MIN_Y +
        Math.random() * (CONFIG.CLOUD.MAX_Y - CONFIG.CLOUD.MIN_Y);
      const scale = 0.6 + Math.random() * 0.6;
      this._clouds.push(new CloudInstance(CONFIG.CANVAS_WIDTH + 20, y, scale));
    }

    for (const cloud of this._clouds) cloud.update(speed);
    this._clouds = this._clouds.filter(c => !c.offscreen);
  }

  draw(ctx) {
    for (const cloud of this._clouds) cloud.draw(ctx);
  }
}
