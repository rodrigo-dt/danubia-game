import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import { createActionPromptWidget } from './actionPrompt';

export class InteractionPrompt extends Phaser.GameObjects.Container {
    private readonly prompt: ReturnType<typeof createActionPromptWidget>;

    constructor(scene: Phaser.Scene) {
        super(scene, GAME_WIDTH / 2, GAME_HEIGHT - 56);

        this.prompt = createActionPromptWidget(
            scene,
            0,
            0,
            '',
            {
                minWidth: 182,
                height: 40,
                paddingX: 16,
                paddingY: 8,
                backgroundColor: 0x0f172a,
                backgroundAlpha: 0.74,
                borderColor: 0xe8d09a,
                borderAlpha: 0.26,
                badgeWidth: 30,
                badgeHeight: 22,
                badgeColor: 0x111827,
                badgeAlpha: 0.95,
                badgeStrokeColor: 0xe8d09a,
                badgeStrokeAlpha: 0.34,
                keyFontSize: '13px',
                keyLabel: '▢',
                labelFontSize: '13px',
                labelMaxWidth: 300,
            },
        );

        this.add(this.prompt.container);
        this.setDepth(900);
        this.setScrollFactor(0);
        this.setVisible(false);

        scene.add.existing(this);
    }

    show(text: string): void {
        this.prompt.setText(text);
        this.setVisible(true);
    }

    hide(): void {
        this.setVisible(false);
    }
}
