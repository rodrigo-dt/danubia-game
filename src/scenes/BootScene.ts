import Phaser from 'phaser';
import { ASSET_PATH, SCENE_KEYS } from '../game/constants';
import { DANUBIA_ASSET_KEYS } from '../characters/Danubia';

const ASSET_KEYS = {
    cover: 'bg-cover',
    homeLivingRoom: 'bg-home-living-room',
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
            DANUBIA_ASSET_KEYS.idle,
            `${ASSET_PATH}/characters/danubia/danubia-idle.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.jump,
            `${ASSET_PATH}/characters/danubia/danubia-jump.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk01,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-01.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk02,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-02.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk03,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-03.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk04,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-04.png`,
        );
    }

    create(): void {
        if (!this.anims.exists(DANUBIA_ASSET_KEYS.walkAnimation)) {
            this.anims.create({
                key: DANUBIA_ASSET_KEYS.walkAnimation,
                frames: [
                    { key: DANUBIA_ASSET_KEYS.walk01 },
                    { key: DANUBIA_ASSET_KEYS.walk02 },
                    { key: DANUBIA_ASSET_KEYS.walk03 },
                    { key: DANUBIA_ASSET_KEYS.walk04 },
                ],
                frameRate: 8,
                repeat: -1,
            });
        }

        this.scene.start(SCENE_KEYS.menu);
    }
}
