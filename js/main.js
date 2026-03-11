import { Game } from './Game.js';
import { CONFIG } from './config.js';

/**
 * Entry point.
 * Keeps the canvas responsive while preserving the internal resolution.
 */
function init() {
  const canvas = document.getElementById('gameCanvas');
  canvas.width  = CONFIG.CANVAS_WIDTH;
  canvas.height = CONFIG.CANVAS_HEIGHT;

  // Scale canvas to fit the viewport while preserving aspect ratio
  function resize() {
    const maxW = Math.min(window.innerWidth - 32, CONFIG.CANVAS_WIDTH);
    const scale = maxW / CONFIG.CANVAS_WIDTH;
    canvas.style.width  = `${CONFIG.CANVAS_WIDTH  * scale}px`;
    canvas.style.height = `${CONFIG.CANVAS_HEIGHT * scale}px`;
  }
  resize();
  window.addEventListener('resize', resize);

  const game = new Game(canvas);
  game.start();
}

// Wait for DOM before initialising
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
