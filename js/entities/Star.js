import { CONFIG } from '../config.js';

/**
 * Background stars shown during night mode.
 */
export class StarField {
  constructor() {
    this._stars = this._generate();
  }

  _generate() {
    const stars = [];
    for (let i = 0; i < CONFIG.STAR.COUNT; i++) {
      stars.push({
        x: Math.random() * CONFIG.CANVAS_WIDTH,
        y: CONFIG.STAR.MIN_Y +
          Math.random() * (CONFIG.STAR.MAX_Y - CONFIG.STAR.MIN_Y),
        r: 0.5 + Math.random() * 1.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    return stars;
  }

  update(speed) {
    for (const s of this._stars) {
      s.x -= speed * 0.05;
      s.twinkle += 0.05;
      if (s.x < 0) s.x = CONFIG.CANVAS_WIDTH;
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} alpha - 0 (day) to 1 (full night)
   */
  draw(ctx, alpha) {
    if (alpha <= 0) return;
    for (const s of this._stars) {
      const brightness = 0.5 + 0.5 * Math.sin(s.twinkle);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
