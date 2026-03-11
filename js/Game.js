import { CONFIG } from './config.js';
import { Dino } from './entities/Dino.js';
import { Ground } from './entities/Ground.js';
import { CloudManager } from './entities/Cloud.js';
import { StarField } from './entities/Star.js';
import { ScoreManager } from './managers/ScoreManager.js';
import { ObstacleManager } from './managers/ObstacleManager.js';

/**
 * Game states as a plain object enum.
 * Using a string-valued enum makes debugging easier.
 */
export const GameState = Object.freeze({
  IDLE:     'IDLE',
  RUNNING:  'RUNNING',
  GAMEOVER: 'GAMEOVER',
});

/**
 * Top-level game controller.
 *
 * Responsibilities:
 *  - Own the game loop (requestAnimationFrame)
 *  - Coordinate all subsystems
 *  - Handle input events
 *  - Render overlays (start screen, game-over screen)
 *
 * It does NOT contain game logic that belongs to individual entities.
 */
export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._state = GameState.IDLE;
    this._speed = CONFIG.INITIAL_SPEED;
    this._frameId = null;

    // Night-mode cycle
    this._nightAlpha = 0;       // 0 = full day, 1 = full night
    this._nightDir = 1;         // 1 = fading to night, -1 = back to day

    // Subsystems
    this._dino = new Dino();
    this._ground = new Ground();
    this._clouds = new CloudManager();
    this._stars = new StarField();
    this._obstacles = new ObstacleManager();
    this._score = new ScoreManager();

    // Score milestone → flash effect
    this._flashAlpha = 0;
    this._score.onMilestone = () => { this._flashAlpha = 1; };

    // Flash for game over collision
    this._collisionFlash = 0;

    // Duck key state
    this._isDuckKeyDown = false;

    this._bindInput();
    this._loop = this._loop.bind(this);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  start() {
    if (this._frameId !== null) return;
    this._frameId = requestAnimationFrame(this._loop);
  }

  // -------------------------------------------------------------------------
  // Input
  // -------------------------------------------------------------------------

  _bindInput() {
    const { canvas } = this;

    // Keyboard
    window.addEventListener('keydown', e => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this._handleJump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        this._isDuckKeyDown = true;
        this._handleDuck(true);
      }
    });

    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowDown') {
        this._isDuckKeyDown = false;
        this._handleDuck(false);
      }
    });

    // Touch / mouse (tap = jump)
    const onTap = e => {
      e.preventDefault();
      this._handleJump();
    };
    this._canvas.addEventListener('touchstart', onTap, { passive: false });
    this._canvas.addEventListener('mousedown', onTap);
  }

  _handleJump() {
    if (this._state === GameState.IDLE || this._state === GameState.GAMEOVER) {
      this._restart();
      return;
    }
    if (this._state === GameState.RUNNING) {
      this._dino.jump();
    }
  }

  _handleDuck(active) {
    if (this._state !== GameState.RUNNING) return;
    this._dino.duck(active);
  }

  // -------------------------------------------------------------------------
  // Game flow
  // -------------------------------------------------------------------------

  _restart() {
    this._score.reset();
    this._obstacles.reset();
    this._clouds.reset();
    this._ground.reset();
    this._dino.reset();
    this._speed = CONFIG.INITIAL_SPEED;
    this._nightAlpha = 0;
    this._nightDir = 1;
    this._state = GameState.RUNNING;
  }

  _triggerGameOver() {
    this._dino.isDead = true;
    this._state = GameState.GAMEOVER;
    this._collisionFlash = 1;
    // Save high score
    this._score.reset();
  }

  // -------------------------------------------------------------------------
  // Main loop
  // -------------------------------------------------------------------------

  _loop() {
    this._update();
    this._draw();
    this._frameId = requestAnimationFrame(this._loop);
  }

  _update() {
    if (this._state !== GameState.RUNNING) return;

    // Accelerate
    this._speed = Math.min(
      CONFIG.MAX_SPEED,
      this._speed + CONFIG.SPEED_INCREMENT,
    );

    // Night cycle
    this._updateNight();

    // Subsystems
    this._dino.update();
    this._ground.update(this._speed);
    this._clouds.update(this._speed);
    this._stars.update(this._speed);
    this._obstacles.update(this._speed);
    this._score.update();

    // Flash decay
    if (this._flashAlpha > 0) this._flashAlpha -= 0.05;

    // Collision detection
    this._checkCollisions();
  }

  _updateNight() {
    const cycleScore = this._score.score % (CONFIG.NIGHT_THRESHOLD * 2);
    // Fade in during first half, fade out during second half
    if (cycleScore < CONFIG.NIGHT_THRESHOLD) {
      this._nightAlpha = cycleScore / CONFIG.NIGHT_THRESHOLD;
    } else {
      this._nightAlpha = 1 - (cycleScore - CONFIG.NIGHT_THRESHOLD) / CONFIG.NIGHT_THRESHOLD;
    }
    this._nightAlpha = Math.max(0, Math.min(1, this._nightAlpha));
  }

  _checkCollisions() {
    const dinoBounds = this._dino.getBounds();

    for (const obs of this._obstacles.obstacles) {
      const ob = obs.getBounds();
      if (this._aabbOverlap(dinoBounds, ob)) {
        this._triggerGameOver();
        return;
      }
    }
  }

  _aabbOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  _draw() {
    const { _ctx: ctx, _canvas: canvas } = this;
    const isNight = this._nightAlpha > 0.5;

    // Background
    const dayBg  = CONFIG.COLORS.DAY_BG;
    const nightBg = CONFIG.COLORS.NIGHT_BG;
    ctx.fillStyle = this._lerpColor(dayBg, nightBg, this._nightAlpha);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    this._stars.draw(ctx, this._nightAlpha);

    // Game entities
    this._clouds.draw(ctx);
    this._ground.draw(ctx, isNight);
    this._obstacles.draw(ctx, isNight);
    this._dino.draw(ctx, isNight);

    // Score HUD
    this._score.draw(ctx, isNight);

    // Score milestone flash (brief white overlay)
    if (this._flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this._flashAlpha * 0.3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Collision flash
    if (this._collisionFlash > 0) {
      ctx.fillStyle = `rgba(255,80,80,${this._collisionFlash * 0.25})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this._collisionFlash -= 0.08;
    }

    // Overlays
    if (this._state === GameState.IDLE) {
      this._drawIdleScreen(ctx, isNight);
    } else if (this._state === GameState.GAMEOVER) {
      this._drawGameOverScreen(ctx, isNight);
    }
  }

  _drawIdleScreen(ctx, isNight) {
    const fgColor = isNight ? CONFIG.COLORS.NIGHT_FG : CONFIG.COLORS.DAY_FG;
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = CONFIG.CANVAS_HEIGHT / 2;

    ctx.fillStyle = fgColor;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUNNER', cx, cy - 40);

    ctx.font = '14px monospace';
    ctx.fillText('Press SPACE / TAP to start', cx, cy - 10);
    ctx.fillText('↑ Jump   ↓ Duck', cx, cy + 14);

    ctx.textAlign = 'left';
  }

  _drawGameOverScreen(ctx, isNight) {
    const fgColor = isNight ? CONFIG.COLORS.NIGHT_FG : CONFIG.COLORS.DAY_FG;
    const cx = CONFIG.CANVAS_WIDTH / 2;
    const cy = CONFIG.CANVAS_HEIGHT / 2;

    // Semi-transparent panel
    ctx.fillStyle = isNight
      ? 'rgba(26, 26, 46, 0.75)'
      : 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.roundRect(cx - 140, cy - 60, 280, 120, 8);
    ctx.fill();

    ctx.fillStyle = '#cc0000';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, cy - 20);

    ctx.fillStyle = fgColor;
    ctx.font = '14px monospace';
    ctx.fillText(`Score: ${this._score.highScore}`, cx, cy + 8);
    ctx.fillText('Press SPACE / TAP to retry', cx, cy + 34);

    ctx.textAlign = 'left';
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /**
   * Linearly interpolate between two hex colors.
   * @param {string} a - '#rrggbb'
   * @param {string} b - '#rrggbb'
   * @param {number} t - 0..1
   */
  _lerpColor(a, b, t) {
    const parse = hex => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const [ar, ag, ab] = parse(a);
    const [br, bg, bb] = parse(b);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b2 = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${b2})`;
  }
}
