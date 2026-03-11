import { CONFIG } from '../config.js';

/**
 * Scrolling ground with bumpy texture.
 */
export class Ground {
  constructor() {
    this._segments = [
      { x: 0,                           bumps: this._makeBumps(0) },
      { x: CONFIG.GROUND.SEGMENT_WIDTH, bumps: this._makeBumps(1) },
    ];
  }

  _makeBumps(seed) {
    const bumps = [];
    const count = 18 + Math.floor(seed * 7) % 8;
    for (let i = 0; i < count; i++) {
      bumps.push({
        x: Math.floor(Math.random() * CONFIG.GROUND.SEGMENT_WIDTH),
        h: 1 + Math.floor(Math.random() * 3),
        w: 2 + Math.floor(Math.random() * 5),
      });
    }
    return bumps;
  }

  reset() {
    this._segments = [
      { x: 0,                           bumps: this._makeBumps(0) },
      { x: CONFIG.GROUND.SEGMENT_WIDTH, bumps: this._makeBumps(1) },
    ];
  }

  update(speed) {
    for (const seg of this._segments) seg.x -= speed;

    // Recycle segments that scroll off-screen
    if (this._segments[0].x + CONFIG.GROUND.SEGMENT_WIDTH < 0) {
      this._segments.shift();
      const lastX = this._segments[this._segments.length - 1].x;
      this._segments.push({
        x: lastX + CONFIG.GROUND.SEGMENT_WIDTH,
        bumps: this._makeBumps(Math.random()),
      });
    }
  }

  draw(ctx, isNight) {
    const groundColor = isNight
      ? CONFIG.COLORS.GROUND_NIGHT
      : CONFIG.COLORS.GROUND_DAY;

    ctx.fillStyle = groundColor;

    // Main ground line
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.CANVAS_WIDTH, 2);

    // Bumps / texture
    for (const seg of this._segments) {
      for (const bump of seg.bumps) {
        const bx = seg.x + bump.x;
        if (bx < -bump.w || bx > CONFIG.CANVAS_WIDTH) continue;
        ctx.fillRect(bx, CONFIG.GROUND_Y + 3, bump.w, bump.h);
      }
    }
  }
}
