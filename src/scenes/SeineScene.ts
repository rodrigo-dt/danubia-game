import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';

export class SeineScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.seine);
    }

    create(): void {
        installDevModeHotkeys(this);
    }
}
