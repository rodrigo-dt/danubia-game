import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

const PROMPT_STYLE = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 56,
    minWidth: 190,
    height: 42,
    paddingX: 18,
    backgroundColor: 0x000000,
    backgroundAlpha: 0.6,
    borderColor: 0xffffff,
    borderAlpha: 0.12,
    borderWidth: 1,
    keyBadgeWidth: 34,
    keyBadgeHeight: 24,
    keyBadgeColor: 0xffffff,
    keyBadgeAlpha: 0.16,
    keyBadgeStrokeColor: 0xffffff,
    keyBadgeStrokeAlpha: 0.18,
    keyBadgeStrokeWidth: 1,
    keyTextColor: '#ffffff',
    keyTextFontSize: '15px',
    labelTextColor: '#ffffff',
    labelTextFontSize: '15px',
    contentGap: 10,
} as const;

export class InteractionPrompt extends Phaser.GameObjects.Container {
    private readonly background: Phaser.GameObjects.Rectangle;
    private readonly keyBadge: Phaser.GameObjects.Rectangle;
    private readonly keyText: Phaser.GameObjects.Text;
    private readonly labelText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        super(scene, PROMPT_STYLE.x, PROMPT_STYLE.y);

        this.background = scene.add.rectangle(
            0,
            0,
            PROMPT_STYLE.minWidth,
            PROMPT_STYLE.height,
            PROMPT_STYLE.backgroundColor,
            PROMPT_STYLE.backgroundAlpha,
        );
        this.background.setStrokeStyle(
            PROMPT_STYLE.borderWidth,
            PROMPT_STYLE.borderColor,
            PROMPT_STYLE.borderAlpha,
        );

        this.keyBadge = scene.add.rectangle(
            0,
            0,
            PROMPT_STYLE.keyBadgeWidth,
            PROMPT_STYLE.keyBadgeHeight,
            PROMPT_STYLE.keyBadgeColor,
            PROMPT_STYLE.keyBadgeAlpha,
        );
        this.keyBadge.setStrokeStyle(
            PROMPT_STYLE.keyBadgeStrokeWidth,
            PROMPT_STYLE.keyBadgeStrokeColor,
            PROMPT_STYLE.keyBadgeStrokeAlpha,
        );

        this.keyText = scene.add.text(0, 0, 'E', {
            fontFamily: 'Arial',
            fontSize: PROMPT_STYLE.keyTextFontSize,
            color: PROMPT_STYLE.keyTextColor,
            fontStyle: 'bold',
            align: 'center',
        }).setOrigin(0.5);

        this.labelText = scene.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: PROMPT_STYLE.labelTextFontSize,
            color: PROMPT_STYLE.labelTextColor,
            align: 'left',
        }).setOrigin(0, 0.5);

        this.add([this.background, this.keyBadge, this.keyText, this.labelText]);
        this.setDepth(900);
        this.setScrollFactor(0);
        this.setVisible(false);

        scene.add.existing(this);
    }

    show(text: string): void {
        const label = this.formatLabel(text);
        const contentWidth =
            PROMPT_STYLE.keyBadgeWidth +
            PROMPT_STYLE.contentGap +
            this.labelText.setText(label).width;
        const backgroundWidth = Math.max(
            PROMPT_STYLE.minWidth,
            contentWidth + PROMPT_STYLE.paddingX * 2,
        );
        const left = -backgroundWidth / 2 + PROMPT_STYLE.paddingX;

        this.background.width = backgroundWidth;
        this.keyBadge.setPosition(
            left + PROMPT_STYLE.keyBadgeWidth / 2,
            0,
        );
        this.keyText.setPosition(this.keyBadge.x, this.keyBadge.y);
        this.labelText.setPosition(
            this.keyBadge.x + PROMPT_STYLE.keyBadgeWidth / 2 + PROMPT_STYLE.contentGap,
            0,
        );
        this.setVisible(true);
    }

    hide(): void {
        this.setVisible(false);
    }

    private formatLabel(text: string): string {
        if (text.toLowerCase().includes('interagir')) {
            return 'Interagir';
        }

        return text;
    }
}
