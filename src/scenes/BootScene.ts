import Phaser from 'phaser';
import { ASSET_PATH, SCENE_KEYS } from '../game/constants';
import { DANUBIA_ASSET_KEYS } from '../characters/Danubia';
import { homeRoomBackgroundPaths, homeRooms } from '../data/homeRooms';

const ASSET_KEYS = {
    cover: 'bg-cover',
} as const;

export class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.boot);
    }

    preload(): void {
        this.load.image(ASSET_KEYS.cover, `${ASSET_PATH}/backgrounds/cover.png`);
        this.load.image('ui-dialogue-frame', `${ASSET_PATH}/ui/ui-dialogue-frame.png`);
        this.load.image(
            'danubia-portrait-normal',
            `${ASSET_PATH}/characters/danubia/portrait/danubia-portrait-normal.png`,
        );
        this.load.image(
            'danubia-portrait-sad',
            `${ASSET_PATH}/characters/danubia/portrait/danubia-portrait-sad.png`,
        );

        for (const roomId of Object.keys(homeRooms) as Array<keyof typeof homeRooms>) {
            const room = homeRooms[roomId];
            this.load.image(room.backgroundKey, homeRoomBackgroundPaths[roomId]);
        }

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
