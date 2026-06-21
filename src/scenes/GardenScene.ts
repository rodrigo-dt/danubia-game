import Phaser from 'phaser';
import { SCENE_KEYS } from '../game/constants';

export class GardenScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.garden);
    }
}
