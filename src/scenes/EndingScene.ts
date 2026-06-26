import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';

export class EndingScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.ending);
    }

    create(): void {
        installDevModeHotkeys(this);
    }
}
