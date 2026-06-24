import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';
import type { DialogueLine, Point2D } from '../game/types';

const NARRATION_CONFIG = {
    overlayColor: 0x000000,
    overlayAlpha: 1,
    textWidth: 720,
    textFontSize: '30px',
    textColor: '#ffffff',
    continueOffsetY: 210,
} as const;

const PORTRAIT_CONFIG = {
    overlayColor: 0x040404,
    overlayAlpha: 0.58,
    panelX: 150,
    panelY: 342,
    panelWidth: 760,
    panelHeight: 168,
    panelColor: 0xf8f5ef,
    panelStrokeColor: 0xe5ddd0,
    panelStrokeWidth: 2,
    panelRadius: 24,
    nameX: 290,
    nameY: 364,
    nameFontSize: '19px',
    nameColor: '#111111',
    bodyX: 290,
    bodyY: 408,
    bodyWidth: 560,
    bodyFontSize: '28px',
    bodyColor: '#111111',
    portraitX: 162,
    portraitY: 361,
    portraitWidth: 300,
    portraitHeight: 300,
    portraitShadowColor: 0x000000,
    portraitShadowAlpha: 0.18,
    portraitShadowOffsetX: 12,
    portraitShadowOffsetY: 14,
    portraitFallbackColor: 0xd6d3d1,
    continueX: 830,
    continueY: 468,
} as const;

const BUBBLE_CONFIG = {
    maxWidth: 360,
    minWidth: 190,
    minHeight: 66,
    paddingX: 20,
    paddingY: 16,
    offsetY: 118,
    clampPadding: 16,
    backgroundColor: 0xfafaf9,
    backgroundAlpha: 0.97,
    borderColor: 0x111827,
    borderAlpha: 0.18,
    borderWidth: 2,
    radius: 16,
    tailWidth: 24,
    tailHeight: 16,
    textFontSize: '18px',
    textColor: '#111111',
    textVerticalOffset: -2,
} as const;

const CONTINUE_PROMPT_STYLE = {
    height: 34,
    paddingX: 14,
    gap: 8,
    minWidth: 156,
    backgroundColor: 0x000000,
    backgroundAlpha: 0.56,
    borderColor: 0xffffff,
    borderAlpha: 0.12,
    borderWidth: 1,
    badgeWidth: 28,
    badgeHeight: 20,
    badgeColor: 0xffffff,
    badgeAlpha: 0.14,
    badgeStrokeColor: 0xffffff,
    badgeStrokeAlpha: 0.18,
    badgeStrokeWidth: 1,
    keyFontSize: '13px',
    keyColor: '#ffffff',
    labelFontSize: '13px',
    labelColor: '#ffffff',
    text: 'Pular diálogo',
} as const;

export class DialogueBox extends Phaser.GameObjects.Container {
    private readonly narrationOverlay: Phaser.GameObjects.Rectangle;
    private readonly narrationText: Phaser.GameObjects.Text;
    private readonly narrationContinuePrompt: Phaser.GameObjects.Container;
    private readonly portraitOverlay: Phaser.GameObjects.Rectangle;
    private readonly portraitPanel: Phaser.GameObjects.Rectangle;
    private readonly portraitShadow: Phaser.GameObjects.Ellipse;
    private readonly portraitImage: Phaser.GameObjects.Image;
    private readonly portraitNameText: Phaser.GameObjects.Text;
    private readonly portraitBodyText: Phaser.GameObjects.Text;
    private readonly portraitContinuePrompt: Phaser.GameObjects.Container;
    private readonly bubbleGraphics: Phaser.GameObjects.Graphics;
    private readonly bubbleText: Phaser.GameObjects.Text;
    private currentMode?: DialogueLine['mode'];

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.narrationOverlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            NARRATION_CONFIG.overlayColor,
            NARRATION_CONFIG.overlayAlpha,
        );
        this.narrationText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            fontFamily: 'Arial',
            fontSize: NARRATION_CONFIG.textFontSize,
            color: NARRATION_CONFIG.textColor,
            align: 'center',
            wordWrap: {
                width: NARRATION_CONFIG.textWidth,
                useAdvancedWrap: true,
            },
            lineSpacing: 10,
        }).setOrigin(0.5);
        this.narrationContinuePrompt = this.createContinuePrompt(
            scene,
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 + NARRATION_CONFIG.continueOffsetY,
        );

        this.portraitOverlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            PORTRAIT_CONFIG.overlayColor,
            PORTRAIT_CONFIG.overlayAlpha,
        );
        this.portraitPanel = scene.add.rectangle(
            PORTRAIT_CONFIG.panelX + PORTRAIT_CONFIG.panelWidth / 2,
            PORTRAIT_CONFIG.panelY + PORTRAIT_CONFIG.panelHeight / 2,
            PORTRAIT_CONFIG.panelWidth,
            PORTRAIT_CONFIG.panelHeight,
            PORTRAIT_CONFIG.panelColor,
            1,
        );
        this.portraitPanel.setStrokeStyle(
            PORTRAIT_CONFIG.panelStrokeWidth,
            PORTRAIT_CONFIG.panelStrokeColor,
            1,
        );
        this.portraitPanel.setOrigin(0.5);

        this.portraitShadow = scene.add.ellipse(
            PORTRAIT_CONFIG.portraitX + PORTRAIT_CONFIG.portraitShadowOffsetX,
            PORTRAIT_CONFIG.portraitY + PORTRAIT_CONFIG.portraitShadowOffsetY,
            PORTRAIT_CONFIG.portraitWidth * 0.7,
            PORTRAIT_CONFIG.portraitHeight * 0.18,
            PORTRAIT_CONFIG.portraitShadowColor,
            PORTRAIT_CONFIG.portraitShadowAlpha,
        );

        this.portraitImage = scene.add.image(
            PORTRAIT_CONFIG.portraitX,
            PORTRAIT_CONFIG.portraitY,
            'danubia-portrait-normal',
        );
        this.portraitImage.setDisplaySize(
            PORTRAIT_CONFIG.portraitWidth,
            PORTRAIT_CONFIG.portraitHeight,
        );

        this.portraitNameText = scene.add.text(
            PORTRAIT_CONFIG.nameX,
            PORTRAIT_CONFIG.nameY,
            '',
            {
                fontFamily: 'Arial',
                fontSize: PORTRAIT_CONFIG.nameFontSize,
                color: PORTRAIT_CONFIG.nameColor,
                fontStyle: 'bold',
                letterSpacing: 1.5,
            },
        );

        this.portraitBodyText = scene.add.text(
            PORTRAIT_CONFIG.bodyX,
            PORTRAIT_CONFIG.bodyY,
            '',
            {
                fontFamily: 'Arial',
                fontSize: PORTRAIT_CONFIG.bodyFontSize,
                color: PORTRAIT_CONFIG.bodyColor,
                wordWrap: {
                    width: PORTRAIT_CONFIG.bodyWidth,
                    useAdvancedWrap: true,
                },
                lineSpacing: 6,
            },
        );

        this.portraitContinuePrompt = this.createContinuePrompt(
            scene,
            PORTRAIT_CONFIG.continueX,
            PORTRAIT_CONFIG.continueY,
        );

        this.bubbleGraphics = scene.add.graphics();
        this.bubbleText = scene.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: BUBBLE_CONFIG.textFontSize,
            color: BUBBLE_CONFIG.textColor,
            align: 'center',
            wordWrap: {
                width: BUBBLE_CONFIG.maxWidth - BUBBLE_CONFIG.paddingX * 2,
                useAdvancedWrap: true,
            },
            lineSpacing: 3,
        }).setOrigin(0.5);
        this.add([
            this.narrationOverlay,
            this.narrationText,
            this.narrationContinuePrompt,
            this.portraitOverlay,
            this.portraitPanel,
            this.portraitShadow,
            this.portraitImage,
            this.portraitNameText,
            this.portraitBodyText,
            this.portraitContinuePrompt,
            this.bubbleGraphics,
            this.bubbleText,
        ]);

        this.setScrollFactor(0);
        this.setDepth(960);
        this.setVisible(false);

        scene.add.existing(this);
    }

    showLine(line: DialogueLine): void {
        this.currentMode = line.mode;
        this.setVisible(true);
        this.setModeVisibility(line.mode);

        if (line.mode === 'narration') {
            this.narrationText.setText('');
            return;
        }

        if (line.mode === 'bubble') {
            this.bubbleText.setText('');
            this.redrawBubble();
            return;
        }

        this.updatePortrait(line.portraitKey);
        this.portraitNameText.setText((line.speaker ?? '').toUpperCase());
        this.portraitBodyText.setText('');
    }

    hide(): void {
        this.currentMode = undefined;
        this.setVisible(false);
    }

    updateBubbleAnchor(anchor?: Point2D): void {
        if (this.currentMode !== 'bubble' || !anchor) {
            return;
        }

        const halfWidth = this.getBubbleWidth() * 0.5;
        const x = Phaser.Math.Clamp(
            anchor.x,
            halfWidth + BUBBLE_CONFIG.clampPadding,
            GAME_WIDTH - halfWidth - BUBBLE_CONFIG.clampPadding,
        );
        const y = Phaser.Math.Clamp(
            anchor.y - BUBBLE_CONFIG.offsetY,
            92,
            GAME_HEIGHT - 120,
        );

        this.bubbleGraphics.setPosition(x, y);
        this.bubbleText.setPosition(x, y + BUBBLE_CONFIG.textVerticalOffset);
    }

    setDisplayedText(text: string): void {
        if (!this.currentMode) {
            return;
        }

        if (this.currentMode === 'narration') {
            this.narrationText.setText(text);
            return;
        }

        if (this.currentMode === 'bubble') {
            this.bubbleText.setText(text);
            this.redrawBubble();
            return;
        }

        this.portraitBodyText.setText(text);
    }

    setContinuePromptVisible(visible: boolean): void {
        if (!this.currentMode) {
            return;
        }

        this.narrationContinuePrompt.setVisible(
            visible && this.currentMode === 'narration',
        );
        this.portraitContinuePrompt.setVisible(
            visible && this.currentMode === 'portrait',
        );
    }

    private setModeVisibility(mode: DialogueLine['mode']): void {
        const isNarration = mode === 'narration';
        const isPortrait = mode === 'portrait';
        const isBubble = mode === 'bubble';

        this.narrationOverlay.setVisible(isNarration);
        this.narrationText.setVisible(isNarration);
        this.narrationContinuePrompt.setVisible(false);

        this.portraitOverlay.setVisible(isPortrait);
        this.portraitPanel.setVisible(isPortrait);
        this.portraitShadow.setVisible(isPortrait);
        this.portraitImage.setVisible(isPortrait);
        this.portraitNameText.setVisible(isPortrait);
        this.portraitBodyText.setVisible(isPortrait);
        this.portraitContinuePrompt.setVisible(false);

        this.bubbleGraphics.setVisible(isBubble);
        this.bubbleText.setVisible(isBubble);
    }

    private updatePortrait(portraitKey?: string): void {
        if (portraitKey && this.scene.textures.exists(portraitKey)) {
            this.portraitImage.setVisible(true);
            this.portraitImage.setTexture(portraitKey);
            this.portraitImage.setTint(0xffffff);
            return;
        }

        if (this.scene.textures.exists('danubia-portrait-normal')) {
            this.portraitImage.setVisible(true);
            this.portraitImage.setTexture('danubia-portrait-normal');
            this.portraitImage.setTint(PORTRAIT_CONFIG.portraitFallbackColor);
            return;
        }

        this.portraitImage.setVisible(false);
    }

    private redrawBubble(): void {
        const bubbleWidth = this.getBubbleWidth();
        const bubbleHeight = this.getBubbleHeight();
        const left = -bubbleWidth / 2;
        const top = -bubbleHeight / 2;
        const tailHalfWidth = BUBBLE_CONFIG.tailWidth / 2;
        const tailStartY = bubbleHeight / 2 - 2;

        this.bubbleGraphics.clear();
        this.bubbleGraphics.fillStyle(
            BUBBLE_CONFIG.backgroundColor,
            BUBBLE_CONFIG.backgroundAlpha,
        );
        this.bubbleGraphics.lineStyle(
            BUBBLE_CONFIG.borderWidth,
            BUBBLE_CONFIG.borderColor,
            BUBBLE_CONFIG.borderAlpha,
        );
        this.bubbleGraphics.fillRoundedRect(
            left,
            top,
            bubbleWidth,
            bubbleHeight,
            BUBBLE_CONFIG.radius,
        );
        this.bubbleGraphics.strokeRoundedRect(
            left,
            top,
            bubbleWidth,
            bubbleHeight,
            BUBBLE_CONFIG.radius,
        );
        this.bubbleGraphics.fillTriangle(
            -tailHalfWidth,
            tailStartY,
            tailHalfWidth,
            tailStartY,
            0,
            tailStartY + BUBBLE_CONFIG.tailHeight,
        );
        this.bubbleGraphics.strokeTriangle(
            -tailHalfWidth,
            tailStartY,
            tailHalfWidth,
            tailStartY,
            0,
            tailStartY + BUBBLE_CONFIG.tailHeight,
        );
    }

    private getBubbleWidth(): number {
        return Math.min(
            BUBBLE_CONFIG.maxWidth,
            Math.max(
                BUBBLE_CONFIG.minWidth,
                this.bubbleText.width + BUBBLE_CONFIG.paddingX * 2,
            ),
        );
    }

    private getBubbleHeight(): number {
        return Math.max(
            BUBBLE_CONFIG.minHeight,
            this.bubbleText.height + BUBBLE_CONFIG.paddingY * 2,
        );
    }

    private createContinuePrompt(
        scene: Phaser.Scene,
        x: number,
        y: number,
    ): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);
        const background = scene.add.rectangle(
            0,
            0,
            CONTINUE_PROMPT_STYLE.minWidth,
            CONTINUE_PROMPT_STYLE.height,
            CONTINUE_PROMPT_STYLE.backgroundColor,
            CONTINUE_PROMPT_STYLE.backgroundAlpha,
        );
        background.setStrokeStyle(
            CONTINUE_PROMPT_STYLE.borderWidth,
            CONTINUE_PROMPT_STYLE.borderColor,
            CONTINUE_PROMPT_STYLE.borderAlpha,
        );

        const badge = scene.add.rectangle(
            0,
            0,
            CONTINUE_PROMPT_STYLE.badgeWidth,
            CONTINUE_PROMPT_STYLE.badgeHeight,
            CONTINUE_PROMPT_STYLE.badgeColor,
            CONTINUE_PROMPT_STYLE.badgeAlpha,
        );
        badge.setStrokeStyle(
            CONTINUE_PROMPT_STYLE.badgeStrokeWidth,
            CONTINUE_PROMPT_STYLE.badgeStrokeColor,
            CONTINUE_PROMPT_STYLE.badgeStrokeAlpha,
        );

        const keyText = scene.add.text(0, 0, 'E', {
            fontFamily: 'Arial',
            fontSize: CONTINUE_PROMPT_STYLE.keyFontSize,
            color: CONTINUE_PROMPT_STYLE.keyColor,
            fontStyle: 'bold',
        }).setOrigin(0.5);

        const labelText = scene.add.text(0, 0, CONTINUE_PROMPT_STYLE.text, {
            fontFamily: 'Arial',
            fontSize: CONTINUE_PROMPT_STYLE.labelFontSize,
            color: CONTINUE_PROMPT_STYLE.labelColor,
        }).setOrigin(0, 0.5);

        const contentWidth =
            CONTINUE_PROMPT_STYLE.badgeWidth +
            CONTINUE_PROMPT_STYLE.gap +
            labelText.width;
        const backgroundWidth = Math.max(
            CONTINUE_PROMPT_STYLE.minWidth,
            contentWidth + CONTINUE_PROMPT_STYLE.paddingX * 2,
        );
        const left = -backgroundWidth / 2 + CONTINUE_PROMPT_STYLE.paddingX;

        background.width = backgroundWidth;
        badge.setPosition(left + CONTINUE_PROMPT_STYLE.badgeWidth / 2, 0);
        keyText.setPosition(badge.x, badge.y);
        labelText.setPosition(
            badge.x + CONTINUE_PROMPT_STYLE.badgeWidth / 2 + CONTINUE_PROMPT_STYLE.gap,
            0,
        );

        container.add([background, badge, keyText, labelText]);
        container.setVisible(false);

        return container;
    }
}
