import type { FragmentId, HomeRoomId } from './types';

export type HomePortalState = {
    roomId: HomeRoomId;
    x: number;
    y: number;
    footY: number;
    side: 'left' | 'right';
};

export type HomeSceneState = {
    collectedFragments: number;
    collectedFragmentIds: Set<FragmentId>;
    hasStartedClockSequence: boolean;
    hasUnlockedHomePortal: boolean;
    hasUnlockedPhoneHud: boolean;
    portalState?: HomePortalState;
};

const homeSceneState: HomeSceneState = {
    collectedFragments: 0,
    collectedFragmentIds: new Set<FragmentId>(),
    hasStartedClockSequence: false,
    hasUnlockedHomePortal: false,
    hasUnlockedPhoneHud: false,
    portalState: undefined,
};

export function getHomeSceneState(): HomeSceneState {
    return homeSceneState;
}

export function isFragmentCollected(fragmentId: FragmentId): boolean {
    return homeSceneState.collectedFragmentIds.has(fragmentId);
}

export function collectFragment(fragmentId: FragmentId): number {
    if (homeSceneState.collectedFragmentIds.has(fragmentId)) {
        return homeSceneState.collectedFragments;
    }

    homeSceneState.collectedFragmentIds.add(fragmentId);
    homeSceneState.collectedFragments = homeSceneState.collectedFragmentIds.size;

    return homeSceneState.collectedFragments;
}

export function hasStartedClockSequence(): boolean {
    return homeSceneState.hasStartedClockSequence;
}

export function markClockSequenceStarted(): void {
    homeSceneState.hasStartedClockSequence = true;
}

export function hasUnlockedHomePortal(): boolean {
    return homeSceneState.hasUnlockedHomePortal;
}

export function unlockHomePortal(): void {
    homeSceneState.hasUnlockedHomePortal = true;
}

export function hasUnlockedPhoneHud(): boolean {
    return homeSceneState.hasUnlockedPhoneHud;
}

export function unlockPhoneHud(): void {
    homeSceneState.hasUnlockedPhoneHud = true;
}

export function getHomePortalState(): HomePortalState | undefined {
    return homeSceneState.portalState;
}

export function setHomePortalState(portalState: HomePortalState): void {
    homeSceneState.portalState = portalState;
}
