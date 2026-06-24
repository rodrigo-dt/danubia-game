import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, UI_FONT_FAMILY } from '../game/constants';
import type { DialogueLine, Point2D } from '../game/types';
import { createActionPromptWidget } from './actionPrompt';

const NARRATION_CONFIG = {
    overlayColor: 0x000000,
    overlayAlpha: 1,
    textWidth: 760,
    textFontSize: '28px',
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
    bodyY: 402,
    bodyWidth: 500,
    bodyFontSize: '24px',
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
    continueX: 806,
    continueY: 468,
} as const;

const PHONE_CALL_CONFIG = {
    overlayColor: 0x030712,
    overlayAlpha: 0.64,
    panelX: 170,
    panelY: 336,
    panelWidth: 620,
    panelHeight: 174,
    panelColor: 0xf8f5ef,
    panelStrokeColor: 0xe5ddd0,
    panelStrokeWidth: 2,
    nameX: 218,
    nameY: 360,
    nameFontSize: '19px',
    nameColor: '#111111',
    bodyX: 218,
    bodyY: 400,
    bodyWidth: 468,
    bodyFontSize: '24px',
    bodyColor: '#111111',
    leftPortraitX: 164,
    leftPortraitY: 334,
    leftPortraitWidth: 300,
    leftPortraitHeight: 300,
    rightPortraitX: 796,
    rightPortraitY: 334,
    rightPortraitWidth: 300,
    rightPortraitHeight: 300,
    portraitShadowColor: 0x000000,
    portraitShadowAlpha: 0.16,
    portraitShadowWidth: 192,
    portraitShadowHeight: 38,
    activeAlpha: 1,
    inactiveAlpha: 0.4,
    activeScale: 1,
    inactiveScale: 0.92,
    continueX: 698,
    continueY: 466,
    silhouetteTint: 0x000000,
    fallbackTint: 0xd6d3d1,
} as const;

const BUBBLE_CONFIG = {
    maxWidth: 360,
    minWidth: 190,
    minHeight: 62,
    paddingX: 18,
    paddingY: 14,
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
    textFontSize: '17px',
    textColor: '#111111',
    textVerticalOffset: -2,
} as const;

export class DialogueBox extends Phaser.GameObjects.Container {
    private readonly narrationOverlay: Phaser.GameObjects.Rectangle;
    private readonly narrationText: Phaser.GameObjects.Text;
    private readonly narrationContinuePrompt: ReturnType<typeof createActionPromptWidget>;
    private readonly portraitOverlay: Phaser.GameObjects.Rectangle;
    private readonly portraitPanel: Phaser.GameObjects.Rectangle;
    private readonly portraitShadow: Phaser.GameObjects.Ellipse;
    private readonly portraitImage: Phaser.GameObjects.Image;
    private readonly portraitNameText: Phaser.GameObjects.Text;
    private readonly portraitBodyText: Phaser.GameObjects.Text;
    private readonly portraitContinuePrompt: ReturnType<typeof createActionPromptWidget>;
    private readonly phoneCallOverlay: Phaser.GameObjects.Rectangle;
    private readonly phoneCallPanel: Phaser.GameObjects.Rectangle;
    private readonly phoneCallLeftShadow: Phaser.GameObjects.Ellipse;
    private readonly phoneCallRightShadow: Phaser.GameObjects.Ellipse;
    private readonly phoneCallLeftPortrait: Phaser.GameObjects.Image;
    private readonly phoneCallRightPortrait: Phaser.GameObjects.Image;
    private readonly phoneCallNameText: Phaser.GameObjects.Text;
    private readonly phoneCallBodyText: Phaser.GameObjects.Text;
    private readonly phoneCallContinuePrompt: ReturnType<typeof createActionPromptWidget>;
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
            fontFamily: UI_FONT_FAMILY,
            fontSize: NARRATION_CONFIG.textFontSize,
            color: NARRATION_CONFIG.textColor,
            align: 'center',
            wordWrap: {
                width: NARRATION_CONFIG.textWidth,
                useAdvancedWrap: true,
            },
            lineSpacing: 10,
        }).setOrigin(0.5);
        this.narrationContinuePrompt = createActionPromptWidget(
            scene,
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 + NARRATION_CONFIG.continueOffsetY,
            'Pular diálogo',
            {
                minWidth: 180,
                height: 36,
                paddingX: 14,
                paddingY: 8,
                backgroundColor: 0x0f172a,
                backgroundAlpha: 0.72,
                borderColor: 0xe8d09a,
                borderAlpha: 0.24,
                badgeWidth: 28,
                badgeHeight: 20,
                badgeColor: 0x111827,
                badgeAlpha: 0.95,
                badgeStrokeColor: 0xe8d09a,
                badgeStrokeAlpha: 0.34,
                keyFontSize: '12px',
                labelFontSize: '12px',
                labelMaxWidth: 210,
            },
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
                fontFamily: UI_FONT_FAMILY,
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
                fontFamily: UI_FONT_FAMILY,
                fontSize: PORTRAIT_CONFIG.bodyFontSize,
                color: PORTRAIT_CONFIG.bodyColor,
                wordWrap: {
                    width: PORTRAIT_CONFIG.bodyWidth,
                    useAdvancedWrap: true,
                },
                lineSpacing: 6,
            },
        );

        this.portraitContinuePrompt = createActionPromptWidget(
            scene,
            PORTRAIT_CONFIG.continueX,
            PORTRAIT_CONFIG.continueY,
            'Pular diálogo',
            {
                minWidth: 180,
                height: 36,
                paddingX: 14,
                paddingY: 8,
                backgroundColor: 0x0f172a,
                backgroundAlpha: 0.72,
                borderColor: 0xe8d09a,
                borderAlpha: 0.24,
                badgeWidth: 28,
                badgeHeight: 20,
                badgeColor: 0x111827,
                badgeAlpha: 0.95,
                badgeStrokeColor: 0xe8d09a,
                badgeStrokeAlpha: 0.34,
                keyFontSize: '12px',
                labelFontSize: '12px',
                labelMaxWidth: 210,
            },
        );

        this.phoneCallOverlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            PHONE_CALL_CONFIG.overlayColor,
            PHONE_CALL_CONFIG.overlayAlpha,
        );
        this.phoneCallPanel = scene.add.rectangle(
            PHONE_CALL_CONFIG.panelX + PHONE_CALL_CONFIG.panelWidth / 2,
            PHONE_CALL_CONFIG.panelY + PHONE_CALL_CONFIG.panelHeight / 2,
            PHONE_CALL_CONFIG.panelWidth,
            PHONE_CALL_CONFIG.panelHeight,
            PHONE_CALL_CONFIG.panelColor,
            1,
        );
        this.phoneCallPanel.setStrokeStyle(
            PHONE_CALL_CONFIG.panelStrokeWidth,
            PHONE_CALL_CONFIG.panelStrokeColor,
            1,
        );

        this.phoneCallLeftShadow = scene.add.ellipse(
            PHONE_CALL_CONFIG.leftPortraitX,
            PHONE_CALL_CONFIG.leftPortraitY + 112,
            PHONE_CALL_CONFIG.portraitShadowWidth,
            PHONE_CALL_CONFIG.portraitShadowHeight,
            PHONE_CALL_CONFIG.portraitShadowColor,
            PHONE_CALL_CONFIG.portraitShadowAlpha,
        );
        this.phoneCallRightShadow = scene.add.ellipse(
            PHONE_CALL_CONFIG.rightPortraitX,
            PHONE_CALL_CONFIG.rightPortraitY + 112,
            PHONE_CALL_CONFIG.portraitShadowWidth,
            PHONE_CALL_CONFIG.portraitShadowHeight,
            PHONE_CALL_CONFIG.portraitShadowColor,
            PHONE_CALL_CONFIG.portraitShadowAlpha,
        );

        this.phoneCallLeftPortrait = scene.add.image(
            PHONE_CALL_CONFIG.leftPortraitX,
            PHONE_CALL_CONFIG.leftPortraitY,
            'danubia-portrait-normal',
        );
        this.phoneCallLeftPortrait.setDisplaySize(
            PHONE_CALL_CONFIG.leftPortraitWidth,
            PHONE_CALL_CONFIG.leftPortraitHeight,
        );

        this.phoneCallRightPortrait = scene.add.image(
            PHONE_CALL_CONFIG.rightPortraitX,
            PHONE_CALL_CONFIG.rightPortraitY,
            'danubia-portrait-normal',
        );
        this.phoneCallRightPortrait.setDisplaySize(
            PHONE_CALL_CONFIG.rightPortraitWidth,
            PHONE_CALL_CONFIG.rightPortraitHeight,
        );

        this.phoneCallNameText = scene.add.text(
            PHONE_CALL_CONFIG.nameX,
            PHONE_CALL_CONFIG.nameY,
            '',
            {
                fontFamily: UI_FONT_FAMILY,
                fontSize: PHONE_CALL_CONFIG.nameFontSize,
                color: PHONE_CALL_CONFIG.nameColor,
                fontStyle: 'bold',
                letterSpacing: 1.5,
            },
        );

        this.phoneCallBodyText = scene.add.text(
            PHONE_CALL_CONFIG.bodyX,
            PHONE_CALL_CONFIG.bodyY,
            '',
            {
                fontFamily: UI_FONT_FAMILY,
                fontSize: PHONE_CALL_CONFIG.bodyFontSize,
                color: PHONE_CALL_CONFIG.bodyColor,
                wordWrap: {
                    width: PHONE_CALL_CONFIG.bodyWidth,
                    useAdvancedWrap: true,
                },
                lineSpacing: 6,
            },
        );

        this.phoneCallContinuePrompt = createActionPromptWidget(
            scene,
            PHONE_CALL_CONFIG.continueX,
            PHONE_CALL_CONFIG.continueY,
            'Pular diálogo',
            {
                minWidth: 180,
                height: 36,
                paddingX: 14,
                paddingY: 8,
                backgroundColor: 0x0f172a,
                backgroundAlpha: 0.72,
                borderColor: 0xe8d09a,
                borderAlpha: 0.24,
                badgeWidth: 28,
                badgeHeight: 20,
                badgeColor: 0x111827,
                badgeAlpha: 0.95,
                badgeStrokeColor: 0xe8d09a,
                badgeStrokeAlpha: 0.34,
                keyFontSize: '12px',
                labelFontSize: '12px',
                labelMaxWidth: 210,
            },
        );

        this.bubbleGraphics = scene.add.graphics();
        this.bubbleText = scene.add.text(0, 0, '', {
            fontFamily: UI_FONT_FAMILY,
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
            this.narrationContinuePrompt.container,
            this.portraitOverlay,
            this.portraitPanel,
            this.portraitShadow,
            this.portraitImage,
            this.portraitNameText,
            this.portraitBodyText,
            this.portraitContinuePrompt.container,
            this.phoneCallOverlay,
            this.phoneCallPanel,
            this.phoneCallLeftShadow,
            this.phoneCallRightShadow,
            this.phoneCallLeftPortrait,
            this.phoneCallRightPortrait,
            this.phoneCallNameText,
            this.phoneCallBodyText,
            this.phoneCallContinuePrompt.container,
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

        if (line.mode === 'phoneCall') {
            this.updatePhoneCallPortraits(line);
            this.phoneCallNameText.setText((line.speaker ?? '').toUpperCase());
            this.phoneCallBodyText.setText('');
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

        if (this.currentMode === 'phoneCall') {
            this.phoneCallBodyText.setText(text);
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
        this.phoneCallContinuePrompt.setVisible(
            visible && this.currentMode === 'phoneCall',
        );
    }

    private setModeVisibility(mode: DialogueLine['mode']): void {
        const isNarration = mode === 'narration';
        const isPortrait = mode === 'portrait';
        const isPhoneCall = mode === 'phoneCall';
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

        this.phoneCallOverlay.setVisible(isPhoneCall);
        this.phoneCallPanel.setVisible(isPhoneCall);
        this.phoneCallLeftShadow.setVisible(isPhoneCall);
        this.phoneCallRightShadow.setVisible(isPhoneCall);
        this.phoneCallLeftPortrait.setVisible(isPhoneCall);
        this.phoneCallRightPortrait.setVisible(isPhoneCall);
        this.phoneCallNameText.setVisible(isPhoneCall);
        this.phoneCallBodyText.setVisible(isPhoneCall);
        this.phoneCallContinuePrompt.setVisible(false);

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

    private updatePhoneCallPortraits(line: DialogueLine): void {
        const activeSpeakerSide = line.activeSpeakerSide ?? 'left';
        const activePortraitKey =
            activeSpeakerSide === 'left' ? line.leftPortraitKey : line.rightPortraitKey;
        const activeSilhouette =
            activeSpeakerSide === 'left'
                ? (line.leftPortraitSilhouette ?? false)
                : (line.rightPortraitSilhouette ?? false);
        const activeFallbackKey =
            activeSpeakerSide === 'left' ? 'danubia-portrait-normal' : 'monsieur-portrait-normal';

        const inactivePortraitKey =
            activeSpeakerSide === 'left' ? line.rightPortraitKey : line.leftPortraitKey;
        const inactiveSilhouette =
            activeSpeakerSide === 'left'
                ? (line.rightPortraitSilhouette ?? false)
                : (line.leftPortraitSilhouette ?? false);
        const inactiveFallbackKey =
            activeSpeakerSide === 'left' ? 'monsieur-portrait-normal' : 'danubia-portrait-normal';

        this.updatePhoneCallPortrait(
            this.phoneCallLeftPortrait,
            activePortraitKey,
            activeSilhouette,
            activeFallbackKey,
        );
        this.updatePhoneCallPortrait(
            this.phoneCallRightPortrait,
            inactivePortraitKey,
            inactiveSilhouette,
            inactiveFallbackKey,
        );

        this.applyPhoneCallSpeakerState(
            this.phoneCallLeftPortrait,
            this.phoneCallLeftShadow,
            true,
        );
        this.applyPhoneCallSpeakerState(
            this.phoneCallRightPortrait,
            this.phoneCallRightShadow,
            false,
        );
    }

    private updatePhoneCallPortrait(
        image: Phaser.GameObjects.Image,
        portraitKey: string | undefined,
        silhouette: boolean,
        fallbackKey: string,
    ): void {
        const resolvedKey = portraitKey && this.scene.textures.exists(portraitKey)
            ? portraitKey
            : this.scene.textures.exists(fallbackKey)
                ? fallbackKey
                : undefined;

        if (!resolvedKey) {
            image.setVisible(false);
            return;
        }

        image.setVisible(true);
        image.setTexture(resolvedKey);

        if (silhouette) {
            image.setTint(PHONE_CALL_CONFIG.silhouetteTint);
            image.setTintFill();
            return;
        }

        image.clearTint();
    }

    private applyPhoneCallSpeakerState(
        portrait: Phaser.GameObjects.Image,
        shadow: Phaser.GameObjects.Ellipse,
        active: boolean,
    ): void {
        portrait.setAlpha(active ? PHONE_CALL_CONFIG.activeAlpha : PHONE_CALL_CONFIG.inactiveAlpha);
        portrait.setScale(active ? PHONE_CALL_CONFIG.activeScale : PHONE_CALL_CONFIG.inactiveScale);
        shadow.setAlpha(active ? PHONE_CALL_CONFIG.portraitShadowAlpha : PHONE_CALL_CONFIG.portraitShadowAlpha * 0.55);
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

}
