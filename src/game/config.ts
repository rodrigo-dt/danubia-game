import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { BootScene } from '../scenes/BootScene';
import { MenuScene } from '../scenes/MenuScene';
import { HomeScene } from '../scenes/HomeScene';
import { MontmartreScene } from '../scenes/MontmartreScene';
import { SeineScene } from '../scenes/SeineScene';
import { GardenScene } from '../scenes/GardenScene';
import { WorkshopScene } from '../scenes/WorkshopScene';
import { EndingScene } from '../scenes/EndingScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#11152b',
    pixelArt: true,
    roundPixels: true,

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 1200 },
            debug: false,
        },
    },

    input: {
        gamepad: true,
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [
        BootScene,
        MenuScene,
        HomeScene,
        MontmartreScene,
        SeineScene,
        GardenScene,
        WorkshopScene,
        EndingScene,
    ],
};
