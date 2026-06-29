import Phaser from 'phaser';

const PLAYSTATION_BUTTON_INDEX = {
    cross: 0,
    circle: 1,
    square: 2,
    triangle: 3,
} as const;

type ButtonName = keyof typeof PLAYSTATION_BUTTON_INDEX;

type SceneButtonState = Record<ButtonName, boolean>;

const previousButtonStates = new WeakMap<Phaser.Scene, SceneButtonState>();

function getPad(scene: Phaser.Scene): Phaser.Input.Gamepad.Gamepad | undefined {
    return scene.input.gamepad?.getPad(0) ?? undefined;
}

function isGamepadButtonPressed(scene: Phaser.Scene, buttonName: ButtonName): boolean {
    const pad = getPad(scene);

    if (!pad) {
        return false;
    }

    return pad.buttons[PLAYSTATION_BUTTON_INDEX[buttonName]]?.pressed ?? false;
}

function getSceneButtonState(scene: Phaser.Scene): SceneButtonState {
    const existing = previousButtonStates.get(scene);

    if (existing) {
        return existing;
    }

    const initial: SceneButtonState = {
        cross: false,
        circle: false,
        square: false,
        triangle: false,
    };
    previousButtonStates.set(scene, initial);
    return initial;
}

function isGamepadButtonJustPressed(scene: Phaser.Scene, buttonName: ButtonName): boolean {
    const current = isGamepadButtonPressed(scene, buttonName);
    const state = getSceneButtonState(scene);
    const justPressed = current && !state[buttonName];

    state[buttonName] = current;

    return justPressed;
}

export function isConfirmJustPressed(scene: Phaser.Scene): boolean {
    const spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const enterKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const keyboardPressed =
        (spaceKey ? Phaser.Input.Keyboard.JustDown(spaceKey) : false)
        || (enterKey ? Phaser.Input.Keyboard.JustDown(enterKey) : false);

    return keyboardPressed || isGamepadButtonJustPressed(scene, 'cross');
}

export function isInteractJustPressed(scene: Phaser.Scene, interactKey?: Phaser.Input.Keyboard.Key): boolean {
    const keyboardPressed = interactKey ? Phaser.Input.Keyboard.JustDown(interactKey) : false;

    return keyboardPressed || isGamepadButtonJustPressed(scene, 'square');
}

export function isInteractHeld(scene: Phaser.Scene, interactKey?: Phaser.Input.Keyboard.Key): boolean {
    const keyboardHeld = interactKey?.isDown ?? false;

    return keyboardHeld || isGamepadButtonPressed(scene, 'square');
}
