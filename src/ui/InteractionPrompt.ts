import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

export class InteractionPrompt extends Phaser.GameObjects.Container {
    private readonly background: Phaser.GameObjects.Rectangle;
    private readonly label: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        super(scene, GAME_WIDTH / 2, GAME_HEIGHT - 42);

        this.background = scene.add.rectangle(0, 0, 300, 32, 0x000000, 0.72);
        this.label = scene.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);

        this.add([this.background, this.label]);
        this.setDepth(900);
        this.setScrollFactor(0);
        this.setVisible(false);

        scene.add.existing(this);
    }

    show(text: string): void {
        this.label.setText(text);
        this.background.width = Math.max(220, this.label.width + 28);
        this.setVisible(true);
    }

    hide(): void {
        this.setVisible(false);
    }
}
