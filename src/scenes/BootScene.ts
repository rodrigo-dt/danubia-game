import Phaser from 'phaser';
import { ASSET_PATH, SCENE_KEYS } from '../game/constants';

const ASSET_KEYS = {
    cover: 'bg-cover',
    homeLivingRoom: 'bg-home-living-room',
    danubiaIdle: 'danubia-idle',
} as const;

export class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.boot);
    }

    preload(): void {
        this.load.image(ASSET_KEYS.cover, `${ASSET_PATH}/backgrounds/cover.png`);
        this.load.image(
            ASSET_KEYS.homeLivingRoom,
            `${ASSET_PATH}/backgrounds/bg-home-living-room.png`,
        );
        this.load.image(
            ASSET_KEYS.danubiaIdle,
            `${ASSET_PATH}/characters/danubia/danubia-idle.png`,
        );
    }

    create(): void {
        this.scene.start(SCENE_KEYS.menu);
    }
}
