import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';
import { installDevModeHotkeys } from '../game/devMode';

export class WorkshopScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.workshop);
    }

    create(): void {
        installDevModeHotkeys(this);
    }
}
