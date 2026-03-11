import { CONFIG } from '../config.js';
import {
  SmallCactus,
  LargeCactus,
  CactusCluster,
  Pterodactyl,
} from '../entities/Obstacle.js';

// Pool of obstacle types with relative spawn weights.
// Adding a new obstacle type is as simple as appending to this array.
const OBSTACLE_TYPES = [
  { Class: SmallCactus,   weight: 3 },
  { Class: LargeCactus,   weight: 2 },
  { Class: CactusCluster, weight: 1 },
  { Class: Pterodactyl,   weight: 2 },
];

const TOTAL_WEIGHT = OBSTACLE_TYPES.reduce((s, t) => s + t.weight, 0);

function pickObstacleClass() {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const entry of OBSTACLE_TYPES) {
    roll -= entry.weight;
    if (roll <= 0) return entry.Class;
  }
  return SmallCactus;
}

/**
 * Manages obstacle spawning, updating, and cleanup.
 */
export class ObstacleManager {
  constructor() {
    this._obstacles = [];
    this._timer = 0;
    this._nextInterval = this._randomInterval();
  }

  reset() {
    this._obstacles = [];
    this._timer = 0;
    this._nextInterval = this._randomInterval();
  }

  _randomInterval() {
    const { MIN_INTERVAL, MAX_INTERVAL } = CONFIG.OBSTACLE;
    return MIN_INTERVAL + Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL));
  }

  update(speed) {
    this._timer++;

    if (this._timer >= this._nextInterval) {
      this._timer = 0;
      this._nextInterval = this._randomInterval();
      const ObstacleClass = pickObstacleClass();
      this._obstacles.push(new ObstacleClass(CONFIG.CANVAS_WIDTH + 20, speed));
    }

    for (const obs of this._obstacles) obs.update(speed);
    this._obstacles = this._obstacles.filter(o => !o.offscreen);
  }

  draw(ctx, isNight) {
    for (const obs of this._obstacles) obs.draw(ctx, isNight);
  }

  /** @returns {Obstacle[]} */
  get obstacles() { return this._obstacles; }
}
