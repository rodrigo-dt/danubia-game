import Phaser from 'phaser';
import { UI_FONT_FAMILY } from '../game/constants';

export type ActionPromptStyle = {
    minWidth: number;
    height: number;
    paddingX: number;
    paddingY: number;
    gap: number;
    backgroundColor: number;
    backgroundAlpha: number;
    borderColor: number;
    borderAlpha: number;
    borderWidth: number;
    badgeWidth: number;
    badgeHeight: number;
    badgeColor: number;
    badgeAlpha: number;
    badgeStrokeColor: number;
    badgeStrokeAlpha: number;
    badgeStrokeWidth: number;
    keyFontSize: string;
    keyColor: string;
    labelFontSize: string;
    labelColor: string;
    labelMaxWidth?: number;
};

export type ActionPromptWidget = {
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Rectangle;
    badge: Phaser.GameObjects.Rectangle;
    keyText: Phaser.GameObjects.Text;
    labelText: Phaser.GameObjects.Text;
    setText: (text: string) => void;
    setVisible: (visible: boolean) => void;
};

const DEFAULT_ACTION_PROMPT_STYLE: ActionPromptStyle = {
    minWidth: 170,
    height: 38,
    paddingX: 14,
    paddingY: 9,
    gap: 8,
    backgroundColor: 0x1a1530,
    backgroundAlpha: 0.72,
    borderColor: 0xe8d09a,
    borderAlpha: 0.32,
    borderWidth: 1,
    badgeWidth: 28,
    badgeHeight: 20,
    badgeColor: 0x0f172a,
    badgeAlpha: 0.95,
    badgeStrokeColor: 0xe8d09a,
    badgeStrokeAlpha: 0.36,
    badgeStrokeWidth: 1,
    keyFontSize: '13px',
    keyColor: '#f9f3de',
    labelFontSize: '13px',
    labelColor: '#f8fafc',
    labelMaxWidth: 300,
};

export function createActionPromptWidget(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    options: Partial<ActionPromptStyle> = {},
): ActionPromptWidget {
    const style = {
        ...DEFAULT_ACTION_PROMPT_STYLE,
        ...options,
    };

    const container = new Phaser.GameObjects.Container(scene, x, y);
    const background = scene.add.rectangle(
        0,
        0,
        style.minWidth,
        style.height,
        style.backgroundColor,
        style.backgroundAlpha,
    );
    background.setStrokeStyle(style.borderWidth, style.borderColor, style.borderAlpha);

    const badge = scene.add.rectangle(
        0,
        0,
        style.badgeWidth,
        style.badgeHeight,
        style.badgeColor,
        style.badgeAlpha,
    );
    badge.setStrokeStyle(
        style.badgeStrokeWidth,
        style.badgeStrokeColor,
        style.badgeStrokeAlpha,
    );

    const keyText = scene.add.text(0, 0, 'E', {
        fontFamily: UI_FONT_FAMILY,
        fontSize: style.keyFontSize,
        color: style.keyColor,
        fontStyle: 'bold',
        align: 'center',
    }).setOrigin(0.5);

    const labelText = scene.add.text(0, 0, '', {
        fontFamily: UI_FONT_FAMILY,
        fontSize: style.labelFontSize,
        color: style.labelColor,
        align: 'left',
    }).setOrigin(0, 0.5);

    const layout = (nextLabel: string): void => {
        labelText.setText(nextLabel);
        labelText.setWordWrapWidth(style.labelMaxWidth ?? 300, true);

        const contentWidth = style.badgeWidth + style.gap + labelText.width;
        const contentHeight = Math.max(style.badgeHeight, labelText.height);
        const backgroundWidth = Math.max(style.minWidth, contentWidth + style.paddingX * 2);
        const backgroundHeight = Math.max(style.height, contentHeight + style.paddingY * 2);
        const left = -backgroundWidth / 2 + style.paddingX;

        background.setSize(backgroundWidth, backgroundHeight);
        badge.setPosition(left + style.badgeWidth / 2, 0);
        keyText.setPosition(badge.x, badge.y);
        labelText.setPosition(
            badge.x + style.badgeWidth / 2 + style.gap,
            0,
        );
    };

    layout(label);
    container.add([background, badge, keyText, labelText]);

    return {
        container,
        background,
        badge,
        keyText,
        labelText,
        setText: (nextLabel: string) => layout(nextLabel),
        setVisible: (visible: boolean) => {
            container.setVisible(visible);
        },
    };
}
