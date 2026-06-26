import Phaser from 'phaser';
import { DEV_BOOT_PRESET, DEV_MODE, SCENE_KEYS, type DevBootPreset } from './constants';
import {
    collectAllHomeFragments,
    resetGameState,
    setClockSequenceStarted,
    setHomePortalUnlocked,
    setMontmartrePhoneHintShown,
    setPhoneHudUnlocked,
} from './states';
import type { HomeRoomId } from './types';

export type HomeSceneDevData = {
    devStartRoomId?: HomeRoomId;
    devSkipOpeningDialogue?: boolean;
    devTriggerIncomingCall?: boolean;
    devStartPhoneCall?: boolean;
    devEnsurePortalState?: boolean;
};

type DevLaunchTarget = {
    sceneKey: string;
    data?: object;
};

type DevHotkeyHandlers = {
    onMarkFragments?: () => void;
    onUnlockPhoneHud?: () => void;
    onUnlockHomePortal?: () => void;
};

const DEV_PRESET_CONFIG = {
    homeFragmentsReadyRoomId: 'son-bedroom' as HomeRoomId,
    homeIncomingCallRoomId: 'office' as HomeRoomId,
    homePhoneCallRoomId: 'office' as HomeRoomId,
    homePortalReadyRoomId: 'office' as HomeRoomId,
} as const;

const DEV_SCENE_SHORTCUTS: ReadonlyArray<{
    code: string;
    preset: DevBootPreset;
}> = [
    { code: 'Digit1', preset: 'home-start' },
    { code: 'Digit2', preset: 'montmartre-start' },
    { code: 'Digit3', preset: 'seine-start' },
    { code: 'Digit4', preset: 'garden-start' },
    { code: 'Digit5', preset: 'workshop-start' },
    { code: 'Digit6', preset: 'ending-start' },
] as const;

export function getInitialSceneTarget(): DevLaunchTarget {
    if (!DEV_MODE || DEV_BOOT_PRESET === 'normal') {
        return {
            sceneKey: SCENE_KEYS.menu,
        };
    }

    return buildDevLaunchTarget(DEV_BOOT_PRESET);
}

export function launchDevBootPreset(scene: Phaser.Scene, preset: DevBootPreset = DEV_BOOT_PRESET): void {
    const target = buildDevLaunchTarget(preset);
    startDevTargetScene(scene, target);
}

export function installDevModeHotkeys(
    scene: Phaser.Scene,
    handlers: DevHotkeyHandlers = {},
): void {
    if (!DEV_MODE) {
        return;
    }

    const keyboard = scene.input.keyboard;

    if (!keyboard) {
        return;
    }

    const cleanupCallbacks: Array<() => void> = [];

    const keydownCallback = (event: KeyboardEvent) => {
        if (!shouldHandleDevShortcut(event)) {
            return;
        }

        const sceneShortcut = DEV_SCENE_SHORTCUTS.find((shortcut) => shortcut.code === event.code);

        if (sceneShortcut) {
            event.preventDefault();
            launchDevBootPreset(scene, sceneShortcut.preset);
            return;
        }

        switch (event.code) {
            case 'Digit7':
                event.preventDefault();

                if (handlers.onMarkFragments) {
                    handlers.onMarkFragments();
                    return;
                }

                collectAllHomeFragments();
                console.info('[DEV_MODE] All home fragments marked as collected.');
                return;
            case 'Digit8':
                event.preventDefault();

                if (handlers.onUnlockPhoneHud) {
                    handlers.onUnlockPhoneHud();
                    return;
                }

                setPhoneHudUnlocked(true);
                console.info('[DEV_MODE] Phone HUD unlocked.');
                return;
            case 'Digit9':
                event.preventDefault();

                if (handlers.onUnlockHomePortal) {
                    handlers.onUnlockHomePortal();
                    return;
                }

                setHomePortalUnlocked(true);
                console.info('[DEV_MODE] Home portal unlocked.');
                return;
            case 'Digit0':
                event.preventDefault();
                launchDevBootPreset(scene, 'home-incoming-call');
                return;
            default:
                return;
        }
    };

    keyboard.on('keydown', keydownCallback);
    cleanupCallbacks.push(() => {
        keyboard.off('keydown', keydownCallback);
    });

    scene.events.once('shutdown', () => {
        for (const cleanup of cleanupCallbacks) {
            cleanup();
        }
    });
}

function shouldHandleDevShortcut(event: KeyboardEvent): boolean {
    if (!event.shiftKey || event.repeat) {
        return false;
    }

    const activeElement = document.activeElement;

    if (!activeElement) {
        return true;
    }

    if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement
    ) {
        return false;
    }

    return !(activeElement instanceof HTMLElement && activeElement.isContentEditable);
}

function buildDevLaunchTarget(preset: DevBootPreset): DevLaunchTarget {
    prepareStateForPreset(preset);

    switch (preset) {
        case 'normal':
            return {
                sceneKey: SCENE_KEYS.menu,
            };
        case 'home-start':
            return {
                sceneKey: SCENE_KEYS.home,
            };
        case 'home-fragments-ready':
            return {
                sceneKey: SCENE_KEYS.home,
                data: {
                    devStartRoomId: DEV_PRESET_CONFIG.homeFragmentsReadyRoomId,
                    devSkipOpeningDialogue: true,
                } satisfies HomeSceneDevData,
            };
        case 'home-incoming-call':
            return {
                sceneKey: SCENE_KEYS.home,
                data: {
                    devStartRoomId: DEV_PRESET_CONFIG.homeIncomingCallRoomId,
                    devSkipOpeningDialogue: true,
                    devEnsurePortalState: true,
                    devTriggerIncomingCall: true,
                } satisfies HomeSceneDevData,
            };
        case 'home-phone-call':
            return {
                sceneKey: SCENE_KEYS.home,
                data: {
                    devStartRoomId: DEV_PRESET_CONFIG.homePhoneCallRoomId,
                    devSkipOpeningDialogue: true,
                    devEnsurePortalState: true,
                    devStartPhoneCall: true,
                } satisfies HomeSceneDevData,
            };
        case 'home-portal-ready':
            return {
                sceneKey: SCENE_KEYS.home,
                data: {
                    devStartRoomId: DEV_PRESET_CONFIG.homePortalReadyRoomId,
                    devSkipOpeningDialogue: true,
                    devEnsurePortalState: true,
                } satisfies HomeSceneDevData,
            };
        case 'montmartre-start':
            return {
                sceneKey: SCENE_KEYS.montmartre,
            };
        case 'seine-start':
            return {
                sceneKey: SCENE_KEYS.seine,
            };
        case 'garden-start':
            return {
                sceneKey: SCENE_KEYS.garden,
            };
        case 'workshop-start':
            return {
                sceneKey: SCENE_KEYS.workshop,
            };
        case 'ending-start':
            return {
                sceneKey: SCENE_KEYS.ending,
            };
        default:
            return {
                sceneKey: SCENE_KEYS.menu,
            };
    }
}

function prepareStateForPreset(preset: DevBootPreset): void {
    resetGameState();
    setMontmartrePhoneHintShown(false);

    switch (preset) {
        case 'home-incoming-call':
        case 'home-phone-call':
            collectAllHomeFragments();
            break;
        case 'home-portal-ready':
            collectAllHomeFragments();
            setClockSequenceStarted(true);
            setHomePortalUnlocked(true);
            setPhoneHudUnlocked(true);
            break;
        case 'montmartre-start':
        case 'seine-start':
        case 'garden-start':
        case 'workshop-start':
        case 'ending-start':
            setPhoneHudUnlocked(true);
            break;
        case 'normal':
        case 'home-start':
        case 'home-fragments-ready':
        default:
            break;
    }
}

function startDevTargetScene(scene: Phaser.Scene, target: DevLaunchTarget): void {
    const targetScene = scene.scene.manager.keys[target.sceneKey];

    if (!targetScene) {
        console.warn(`[DEV_MODE] Scene "${target.sceneKey}" is not registered.`);
        return;
    }

    scene.scene.start(target.sceneKey, target.data);
}
