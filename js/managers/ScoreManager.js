import { CONFIG } from '../config.js';

const STORAGE_KEY = 'chromeDino_highScore';

/**
 * Tracks current score and persists high score to localStorage.
 */
export class ScoreManager {
  constructor() {
    this._score = 0;
    this._highScore = this._loadHighScore();
    this._milestone = CONFIG.SCORE.MILESTONE;
    this.onMilestone = null; // callback: () => void
  }

  reset() {
    if (this._score > this._highScore) {
      this._highScore = Math.floor(this._score);
      this._saveHighScore();
    }
    this._score = 0;
    this._milestone = CONFIG.SCORE.MILESTONE;
  }

  update() {
    this._score += CONFIG.SCORE.INCREMENT;

    if (Math.floor(this._score) >= this._milestone) {
      this._milestone += CONFIG.SCORE.MILESTONE;
      if (typeof this.onMilestone === 'function') this.onMilestone();
    }
  }

  get score() { return Math.floor(this._score); }
  get highScore() { return this._highScore; }

  /**
   * Draw score HUD in top-right corner.
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} isNight
   */
  draw(ctx, isNight) {
    const fgColor = isNight ? CONFIG.COLORS.NIGHT_FG : CONFIG.COLORS.DAY_FG;
    ctx.fillStyle = fgColor;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';

    const scoreStr = String(this.score).padStart(5, '0');

    if (this._highScore > 0) {
      ctx.fillStyle = isNight ? '#aaaaaa' : '#999999';
      ctx.fillText(`HI ${String(this._highScore).padStart(5, '0')}`, CONFIG.CANVAS_WIDTH - 90, 24);
      ctx.fillStyle = fgColor;
    }

    ctx.fillText(scoreStr, CONFIG.CANVAS_WIDTH - 16, 24);
    ctx.textAlign = 'left';
  }

  _loadHighScore() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    } catch {
      return 0;
    }
  }

  _saveHighScore() {
    try {
      localStorage.setItem(STORAGE_KEY, String(this._highScore));
    } catch {
      // localStorage may be unavailable (private browsing, etc.)
    }
  }
}
