import * as migration_20251101_075417 from './20251101_075417';

export const migrations = [
  {
    up: migration_20251101_075417.up,
    down: migration_20251101_075417.down,
    name: '20251101_075417'
  },
];
