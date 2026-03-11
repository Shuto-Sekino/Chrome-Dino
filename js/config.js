/**
 * Game configuration constants.
 * Centralizing all magic numbers here makes tuning and maintenance easy.
 */
export const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 300,
  GROUND_Y: 240,

  // Physics
  GRAVITY: 0.6,
  JUMP_VELOCITY: -13,
  DUCK_JUMP_VELOCITY: -8,

  // Game speed
  INITIAL_SPEED: 5,
  MAX_SPEED: 14,
  SPEED_INCREMENT: 0.0008,   // speed added per frame
  NIGHT_THRESHOLD: 700,      // score at which night starts cycling

  // Dino
  DINO: {
    X: 80,
    WIDTH: 44,
    HEIGHT: 48,
    DUCK_HEIGHT: 30,
    SPRITE_RUN_FRAMES: 2,
    SPRITE_FRAME_INTERVAL: 6, // frames between sprite switches
  },

  // Ground
  GROUND: {
    HEIGHT: 12,
    SEGMENT_WIDTH: 600,
  },

  // Obstacles
  OBSTACLE: {
    MIN_INTERVAL: 40,    // minimum frames between spawns
    MAX_INTERVAL: 100,
    PTERODACTYL_HEIGHTS: [100, 150, 190], // y positions (from top of canvas)
  },

  // Clouds
  CLOUD: {
    SPAWN_INTERVAL: 120,
    SPEED_RATIO: 0.3,    // cloud speed relative to game speed
    MIN_Y: 40,
    MAX_Y: 120,
  },

  // Stars (night mode)
  STAR: {
    COUNT: 30,
    MIN_Y: 20,
    MAX_Y: 130,
  },

  // Score
  SCORE: {
    INCREMENT: 0.1,
    MILESTONE: 100,      // plays sound / flashes every N points
  },

  // Colors
  COLORS: {
    DAY_BG: '#ffffff',
    NIGHT_BG: '#1a1a2e',
    DAY_FG: '#535353',
    NIGHT_FG: '#eeeeee',
    GROUND_DAY: '#757575',
    GROUND_NIGHT: '#aaaaaa',
  },
};
