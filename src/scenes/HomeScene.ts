import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS } from '../game/constants';

const ASSET_KEYS = {
    homeLivingRoom: 'bg-home-living-room',
    danubiaIdle: 'danubia-idle',
} as const;

export class HomeScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.home);
    }

    create(): void {
        this.add
            .image(0, 0, ASSET_KEYS.homeLivingRoom)
            .setOrigin(0)
            .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        this.add
            .image(GAME_WIDTH / 2, GAME_HEIGHT - 118, ASSET_KEYS.danubiaIdle)
            .setOrigin(0.5, 1)
            .setScale(2);
    }
}
