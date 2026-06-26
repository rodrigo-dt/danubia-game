import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, UI_FONT_FAMILY } from '../game/constants';
import {
    getRescuedCatsCount,
    getRescuedDogsCount,
    hasUnlockedPhoneHud,
    isFamilyMemberRescued,
} from '../game/states';
import { GAME_HUD_CONFIG } from './GameHud';

type ChecklistCounterRowConfig = {
    label: string;
    y: number;
    resolver: () => string;
    variant: 'animal' | 'family';
};

const FAMILY_ROW_LABELS = {
    daughter: 'RAFA',
    son: 'RÔ',
    husband: 'MARIDO',
} as const;

/**
 * Tela útil do celular expanded, em coordenadas locais.
 *
 * O celular expanded fica centralizado em:
 * x = GAME_WIDTH / 2  => 480
 * y = GAME_HEIGHT / 2 => 270
 *
 * Área útil informada:
 * A: x=361 y=85
 * B: x=599 y=85
 * C: x=361 y=441
 * D: x=599 y=441
 *
 * Convertendo para coordenadas locais do container:
 * x: -119 até 119
 * y: -185 até 171
 */
const PHONE_SCREEN_BOUNDS = {
    left: -119,
    right: 119,
    top: -185,
    bottom: 171,
    width: 238,
    height: 356,
    centerX: 0,
    centerY: -7,
} as const;

const CHECKLIST_COUNTER_ROWS: ChecklistCounterRowConfig[] = [
    {
        label: 'GATOS',
        y: -82,
        variant: 'animal',
        resolver: () => `${getRescuedCatsCount()}/6`,
    },
    {
        label: 'CACHORROS',
        y: -42,
        variant: 'animal',
        resolver: () => `${getRescuedDogsCount()}/3`,
    },
    {
        label: FAMILY_ROW_LABELS.daughter,
        y: 50,
        variant: 'family',
        resolver: () => `${isFamilyMemberRescued('daughter') ? 1 : 0}/1`,
    },
    {
        label: FAMILY_ROW_LABELS.son,
        y: 92,
        variant: 'family',
        resolver: () => `${isFamilyMemberRescued('son') ? 1 : 0}/1`,
    },
    {
        label: FAMILY_ROW_LABELS.husband,
        y: 134,
        variant: 'family',
        resolver: () => `${isFamilyMemberRescued('husband') ? 1 : 0}/1`,
    },
];

export const PHONE_CHECKLIST_CONFIG = {
    toggleKeyCode: Phaser.Input.Keyboard.KeyCodes.TAB,
    depth: 940,
    overlayColor: 0x020617,
    overlayAlpha: 0.42,

    compact: {
        x: GAME_HUD_CONFIG.compactPhone.x,
        y: GAME_HUD_CONFIG.compactPhone.y,
        startScale: 0.28,
        expandedCornerScale: 0.46,
        compactRestoreDelayMs: 40,
    },

    expanded: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        scale: 1,
    },

    animation: {
        cornerExpandDurationMs: 150,
        moveToCenterDurationMs: 240,
        closeToCornerDurationMs: 220,
        fadeInContentDurationMs: 140,
        fadeOutContentDurationMs: 110,
    },

    layout: {
        screen: PHONE_SCREEN_BOUNDS,

        panelX: PHONE_SCREEN_BOUNDS.centerX,
        panelY: PHONE_SCREEN_BOUNDS.centerY,
        panelWidth: 218,
        panelHeight: 322,

        titleY: -156,
        titleDividerY: -130,

        animalsTitleY: -116,
        familyTitleY: 8,
        familyDividerY: 25,

        rowCardX: 0,
        rowCardWidth: 198,
        rowCardHeight: 31,

        rowAccentX: -94,
        rowAccentWidth: 3,
        rowAccentHeight: 19,

        rowLabelX: -82,
        rowBoxX: 75,

        boxWidth: 58,
        boxHeight: 24,

        bottomHintY: 158,
    },

    font: {
        family: UI_FONT_FAMILY,

        titleSize: '22px',
        sectionSize: '10px',
        rowSize: '13px',
        counterSize: '13px',
        hintSize: '9px',

        titleColor: '#f8fafc',
        sectionColor: '#c4b5fd',
        labelColor: '#f8fafc',
        counterColor: '#fff7d6',
        hintColor: '#8ba3c7',
    },

    colors: {
        panelFill: 0x07111f,
        panelAlpha: 0.76,
        panelStroke: 0xf6d365,
        panelStrokeAlpha: 0.34,

        titleAccent: 0xf6d365,
        titleAccentAlpha: 0.78,

        animalAccent: 0x7dd3fc,
        familyAccent: 0xc084fc,

        rowFill: 0x111c31,
        rowFillAlpha: 0.58,
        rowAltFillAlpha: 0.42,
        rowStroke: 0x94a3b8,
        rowStrokeAlpha: 0.14,

        counterFill: 0x1f2d46,
        counterAlpha: 0.88,
        counterStroke: 0xf6d365,
        counterStrokeAlpha: 0.48,

        divider: 0x60a5fa,
        dividerAlpha: 0.34,

        tinyGlow: 0xf6d365,
        tinyGlowAlpha: 0.18,
    },
} as const;

type CounterRowVisual = {
    readonly valueText: Phaser.GameObjects.Text;
    readonly resolver: () => string;
};

export class PhoneChecklist extends Phaser.GameObjects.Container {
    private readonly overlay: Phaser.GameObjects.Rectangle;
    private readonly phoneContainer: Phaser.GameObjects.Container;
    private readonly phoneImage: Phaser.GameObjects.Image;
    private readonly contentContainer: Phaser.GameObjects.Container;
    private readonly counterRows: CounterRowVisual[] = [];
    private open = false;
    private transitionActive = false;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        this.overlay = scene.add.rectangle(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            GAME_WIDTH,
            GAME_HEIGHT,
            PHONE_CHECKLIST_CONFIG.overlayColor,
            0,
        );
        this.overlay.setVisible(false);

        this.phoneImage = scene.add.image(0, 0, 'ui-phone-expanded');
        this.phoneImage.setScale(PHONE_CHECKLIST_CONFIG.expanded.scale);

        this.contentContainer = scene.add.container(0, 0);
        this.buildChecklistContent();
        this.contentContainer.setAlpha(0);

        this.phoneContainer = scene.add.container(
            PHONE_CHECKLIST_CONFIG.compact.x,
            PHONE_CHECKLIST_CONFIG.compact.y,
            [this.phoneImage, this.contentContainer],
        );
        this.phoneContainer.setScale(PHONE_CHECKLIST_CONFIG.compact.startScale);
        this.phoneContainer.setVisible(false);

        this.add([this.overlay, this.phoneContainer]);
        this.setScrollFactor(0);
        this.setDepth(PHONE_CHECKLIST_CONFIG.depth);
        this.setVisible(false);

        scene.add.existing(this);
    }

    get isOpen(): boolean {
        return this.open;
    }

    get blocksMovement(): boolean {
        return this.open || this.transitionActive;
    }

    get isPhoneAnimatingOrVisible(): boolean {
        return this.blocksMovement;
    }

    toggle(): void {
        if (this.transitionActive) {
            return;
        }

        if (this.open) {
            this.close();
            return;
        }

        this.openOverlay();
    }

    refresh(): void {
        if (!hasUnlockedPhoneHud()) {
            if (this.blocksMovement) {
                this.forceClose();
            }

            return;
        }

        for (const row of this.counterRows) {
            row.valueText.setText(row.resolver());
        }
    }

    close(): void {
        if (!this.open || this.transitionActive) {
            return;
        }

        this.transitionActive = true;
        this.open = false;

        this.scene.tweens.killTweensOf(this.overlay);
        this.scene.tweens.killTweensOf(this.phoneContainer);
        this.scene.tweens.killTweensOf(this.contentContainer);

        this.scene.tweens.add({
            targets: this.contentContainer,
            alpha: 0,
            duration: PHONE_CHECKLIST_CONFIG.animation.fadeOutContentDurationMs,
            ease: 'Sine.In',
        });

        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 0,
            duration: PHONE_CHECKLIST_CONFIG.animation.closeToCornerDurationMs,
            ease: 'Sine.In',
        });

        this.scene.tweens.add({
            targets: this.phoneContainer,
            x: PHONE_CHECKLIST_CONFIG.compact.x,
            y: PHONE_CHECKLIST_CONFIG.compact.y,
            scaleX: PHONE_CHECKLIST_CONFIG.compact.expandedCornerScale,
            scaleY: PHONE_CHECKLIST_CONFIG.compact.expandedCornerScale,
            duration: PHONE_CHECKLIST_CONFIG.animation.closeToCornerDurationMs,
            ease: 'Cubic.In',
            onComplete: () => {
                this.phoneContainer.setScale(PHONE_CHECKLIST_CONFIG.compact.startScale);
                this.phoneContainer.setVisible(false);
                this.overlay.setVisible(false);
                this.setVisible(false);
                this.transitionActive = false;
            },
        });
    }

    forceClose(): void {
        this.scene.tweens.killTweensOf(this.overlay);
        this.scene.tweens.killTweensOf(this.phoneContainer);
        this.scene.tweens.killTweensOf(this.contentContainer);

        this.transitionActive = false;
        this.open = false;

        this.overlay.setAlpha(0);
        this.overlay.setVisible(false);

        this.contentContainer.setAlpha(0);

        this.phoneContainer.setVisible(false);
        this.phoneContainer.setPosition(
            PHONE_CHECKLIST_CONFIG.compact.x,
            PHONE_CHECKLIST_CONFIG.compact.y,
        );
        this.phoneContainer.setScale(PHONE_CHECKLIST_CONFIG.compact.startScale);

        this.setVisible(false);
    }

    private openOverlay(): void {
        if (!hasUnlockedPhoneHud()) {
            return;
        }

        this.refresh();

        this.transitionActive = true;
        this.open = true;

        this.setVisible(true);

        this.overlay.setVisible(true);
        this.overlay.setAlpha(0);

        this.phoneContainer.setVisible(true);
        this.phoneContainer.setPosition(
            PHONE_CHECKLIST_CONFIG.compact.x,
            PHONE_CHECKLIST_CONFIG.compact.y,
        );
        this.phoneContainer.setScale(PHONE_CHECKLIST_CONFIG.compact.startScale);

        this.contentContainer.setAlpha(0);

        this.scene.tweens.killTweensOf(this.overlay);
        this.scene.tweens.killTweensOf(this.phoneContainer);
        this.scene.tweens.killTweensOf(this.contentContainer);

        this.scene.tweens.add({
            targets: this.phoneContainer,
            scaleX: PHONE_CHECKLIST_CONFIG.compact.expandedCornerScale,
            scaleY: PHONE_CHECKLIST_CONFIG.compact.expandedCornerScale,
            duration: PHONE_CHECKLIST_CONFIG.animation.cornerExpandDurationMs,
            ease: 'Back.Out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.overlay,
                    alpha: PHONE_CHECKLIST_CONFIG.overlayAlpha,
                    duration: PHONE_CHECKLIST_CONFIG.animation.moveToCenterDurationMs,
                    ease: 'Sine.Out',
                });

                this.scene.tweens.add({
                    targets: this.phoneContainer,
                    x: PHONE_CHECKLIST_CONFIG.expanded.x,
                    y: PHONE_CHECKLIST_CONFIG.expanded.y,
                    scaleX: PHONE_CHECKLIST_CONFIG.expanded.scale,
                    scaleY: PHONE_CHECKLIST_CONFIG.expanded.scale,
                    duration: PHONE_CHECKLIST_CONFIG.animation.moveToCenterDurationMs,
                    ease: 'Cubic.Out',
                    onComplete: () => {
                        this.transitionActive = false;
                    },
                });

                this.scene.tweens.add({
                    targets: this.contentContainer,
                    alpha: 1,
                    delay: Math.floor(PHONE_CHECKLIST_CONFIG.animation.moveToCenterDurationMs * 0.42),
                    duration: PHONE_CHECKLIST_CONFIG.animation.fadeInContentDurationMs,
                    ease: 'Sine.Out',
                });
            },
        });
    }

    private buildChecklistContent(): void {
        const config = PHONE_CHECKLIST_CONFIG;

        const panelGlow = this.scene.add.rectangle(
            config.layout.panelX,
            config.layout.panelY,
            config.layout.panelWidth + 8,
            config.layout.panelHeight + 8,
            config.colors.tinyGlow,
            config.colors.tinyGlowAlpha,
        );

        const panel = this.scene.add.rectangle(
            config.layout.panelX,
            config.layout.panelY,
            config.layout.panelWidth,
            config.layout.panelHeight,
            config.colors.panelFill,
            config.colors.panelAlpha,
        );
        panel.setStrokeStyle(
            1,
            config.colors.panelStroke,
            config.colors.panelStrokeAlpha,
        );

        const title = this.scene.add.text(
            0,
            config.layout.titleY,
            'ENCONTRADOS',
            {
                fontFamily: config.font.family,
                fontSize: config.font.titleSize,
                color: config.font.titleColor,
                fontStyle: 'bold',
                align: 'center',
            },
        ).setOrigin(0.5);

        const titleDivider = this.scene.add.rectangle(
            0,
            config.layout.titleDividerY,
            150,
            2,
            config.colors.titleAccent,
            config.colors.titleAccentAlpha,
        );

        const animalsTitle = this.createSectionTitle(
            'ANIMAIS',
            config.layout.animalsTitleY,
            config.colors.animalAccent,
        );

        const familyTitle = this.createSectionTitle(
            'FAMÍLIA',
            config.layout.familyTitleY,
            config.colors.familyAccent,
        );

        const familyDivider = this.scene.add.rectangle(
            0,
            config.layout.familyDividerY,
            184,
            1,
            config.colors.divider,
            config.colors.dividerAlpha,
        );

        const bottomHint = this.scene.add.text(
            0,
            config.layout.bottomHintY,
            'TAB PARA FECHAR',
            {
                fontFamily: config.font.family,
                fontSize: config.font.hintSize,
                color: config.font.hintColor,
                align: 'center',
            },
        ).setOrigin(0.5);

        this.contentContainer.add([
            panelGlow,
            panel,
            title,
            titleDivider,
            animalsTitle,
            familyTitle,
            familyDivider,
            bottomHint,
        ]);

        CHECKLIST_COUNTER_ROWS.forEach((rowConfig, index) => {
            const row = this.createCounterRow(rowConfig, index);
            this.counterRows.push(row);
        });
    }

    private createSectionTitle(
        text: string,
        y: number,
        accentColor: number,
    ): Phaser.GameObjects.Container {
        const title = this.scene.add.text(
            PHONE_CHECKLIST_CONFIG.layout.rowLabelX,
            y,
            text,
            {
                fontFamily: PHONE_CHECKLIST_CONFIG.font.family,
                fontSize: PHONE_CHECKLIST_CONFIG.font.sectionSize,
                color: PHONE_CHECKLIST_CONFIG.font.sectionColor,
                fontStyle: 'bold',
                letterSpacing: 1,
            },
        ).setOrigin(0, 0.5);

        const accent = this.scene.add.rectangle(
            PHONE_CHECKLIST_CONFIG.layout.rowLabelX - 8,
            y,
            4,
            12,
            accentColor,
            0.82,
        );

        return this.scene.add.container(0, 0, [accent, title]);
    }

    private createCounterRow(
        rowConfig: ChecklistCounterRowConfig,
        index: number,
    ): CounterRowVisual {
        const config = PHONE_CHECKLIST_CONFIG;

        const rowFillAlpha = index % 2 === 0
            ? config.colors.rowFillAlpha
            : config.colors.rowAltFillAlpha;

        const accentColor = rowConfig.variant === 'animal'
            ? config.colors.animalAccent
            : config.colors.familyAccent;

        const rowBackground = this.scene.add.rectangle(
            config.layout.rowCardX,
            rowConfig.y,
            config.layout.rowCardWidth,
            config.layout.rowCardHeight,
            config.colors.rowFill,
            rowFillAlpha,
        );
        rowBackground.setStrokeStyle(
            1,
            config.colors.rowStroke,
            config.colors.rowStrokeAlpha,
        );

        const rowAccent = this.scene.add.rectangle(
            config.layout.rowAccentX,
            rowConfig.y,
            config.layout.rowAccentWidth,
            config.layout.rowAccentHeight,
            accentColor,
            0.85,
        );

        const label = this.scene.add.text(
            config.layout.rowLabelX,
            rowConfig.y,
            rowConfig.label,
            {
                fontFamily: config.font.family,
                fontSize: config.font.rowSize,
                color: config.font.labelColor,
                fontStyle: 'bold',
            },
        ).setOrigin(0, 0.5);

        const boxShadow = this.scene.add.rectangle(
            config.layout.rowBoxX + 2,
            rowConfig.y + 2,
            config.layout.boxWidth,
            config.layout.boxHeight,
            0x000000,
            0.22,
        );

        const box = this.scene.add.rectangle(
            config.layout.rowBoxX,
            rowConfig.y,
            config.layout.boxWidth,
            config.layout.boxHeight,
            config.colors.counterFill,
            config.colors.counterAlpha,
        );
        box.setStrokeStyle(
            1,
            config.colors.counterStroke,
            config.colors.counterStrokeAlpha,
        );

        const valueText = this.scene.add.text(
            config.layout.rowBoxX,
            rowConfig.y,
            rowConfig.resolver(),
            {
                fontFamily: config.font.family,
                fontSize: config.font.counterSize,
                color: config.font.counterColor,
                fontStyle: 'bold',
                align: 'center',
            },
        ).setOrigin(0.5);

        this.contentContainer.add([
            rowBackground,
            rowAccent,
            label,
            boxShadow,
            box,
            valueText,
        ]);

        return {
            valueText,
            resolver: rowConfig.resolver,
        };
    }
}