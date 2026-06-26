import type { FamilyMemberId, FragmentId, HomeRoomId, PetId } from './types';

export const PET_IDS: PetId[] = [
    'pudim',
    'zoe',
    'drogo',
    'pirata',
    'batata',
    'pituca',
    'brecko',
    'lelo',
    'pure',
];

export const DOG_PET_IDS: PetId[] = ['pudim', 'drogo', 'pirata'];
export const CAT_PET_IDS: PetId[] = ['zoe', 'batata', 'pituca', 'brecko', 'lelo', 'pure'];
export const FAMILY_MEMBER_IDS: FamilyMemberId[] = ['son', 'daughter', 'husband'];
export const FRAGMENT_IDS: FragmentId[] = [
    'home-fragment-son-bedroom',
    'home-fragment-daughter-bedroom',
    'home-fragment-office',
];

export type HomePortalState = {
    roomId: HomeRoomId;
    x: number;
    y: number;
    footY: number;
    side: 'left' | 'right';
};

export type GameProgressState = {
    collectedFragments: number;
    collectedFragmentIds: Record<FragmentId, boolean>;
    hasStartedClockSequence: boolean;
    hasUnlockedHomePortal: boolean;
    hasUnlockedPhoneHud: boolean;
    hasShownMontmartrePhoneHint: boolean;
    portalState?: HomePortalState;
    rescuedPets: Record<PetId, boolean>;
    rescuedFamily: Record<FamilyMemberId, boolean>;
    hasFoundPresent: boolean;
};

function createFalseRecord<T extends string>(ids: readonly T[]): Record<T, boolean> {
    return ids.reduce<Record<T, boolean>>((accumulator, id) => {
        accumulator[id] = false;
        return accumulator;
    }, {} as Record<T, boolean>);
}

function createInitialGameState(): GameProgressState {
    return {
        collectedFragments: 0,
        collectedFragmentIds: createFalseRecord(FRAGMENT_IDS),
        hasStartedClockSequence: false,
        hasUnlockedHomePortal: false,
        hasUnlockedPhoneHud: false,
        hasShownMontmartrePhoneHint: false,
        portalState: undefined,
        rescuedPets: createFalseRecord(PET_IDS),
        rescuedFamily: createFalseRecord(FAMILY_MEMBER_IDS),
        hasFoundPresent: false,
    };
}

const gameState: GameProgressState = createInitialGameState();

export function getGameState(): GameProgressState {
    return gameState;
}

export function isFragmentCollected(fragmentId: FragmentId): boolean {
    return gameState.collectedFragmentIds[fragmentId];
}

export function collectFragment(fragmentId: FragmentId): number {
    if (isFragmentCollected(fragmentId)) {
        return gameState.collectedFragments;
    }

    gameState.collectedFragmentIds[fragmentId] = true;
    gameState.collectedFragments += 1;

    return gameState.collectedFragments;
}

export function collectAllHomeFragments(): void {
    for (const fragmentId of FRAGMENT_IDS) {
        collectFragment(fragmentId);
    }
}

export function hasStartedClockSequence(): boolean {
    return gameState.hasStartedClockSequence;
}

export function markClockSequenceStarted(): void {
    gameState.hasStartedClockSequence = true;
}

export function setClockSequenceStarted(started: boolean): void {
    gameState.hasStartedClockSequence = started;
}

export function hasUnlockedHomePortal(): boolean {
    return gameState.hasUnlockedHomePortal;
}

export function unlockHomePortal(): void {
    gameState.hasUnlockedHomePortal = true;
}

export function setHomePortalUnlocked(unlocked: boolean): void {
    gameState.hasUnlockedHomePortal = unlocked;
}

export function hasUnlockedPhoneHud(): boolean {
    return gameState.hasUnlockedPhoneHud;
}

export function unlockPhoneHud(): void {
    gameState.hasUnlockedPhoneHud = true;
}

export function setPhoneHudUnlocked(unlocked: boolean): void {
    gameState.hasUnlockedPhoneHud = unlocked;
}

export function hasShownMontmartrePhoneHint(): boolean {
    return gameState.hasShownMontmartrePhoneHint;
}

export function markMontmartrePhoneHintShown(): void {
    gameState.hasShownMontmartrePhoneHint = true;
}

export function setMontmartrePhoneHintShown(shown: boolean): void {
    gameState.hasShownMontmartrePhoneHint = shown;
}

export function getHomePortalState(): HomePortalState | undefined {
    return gameState.portalState;
}

export function setHomePortalState(portalState: HomePortalState | undefined): void {
    gameState.portalState = portalState;
}

export function isPetRescued(petId: PetId): boolean {
    return gameState.rescuedPets[petId];
}

export function markPetRescued(petId: PetId): void {
    gameState.rescuedPets[petId] = true;
}

export function isFamilyMemberRescued(familyMemberId: FamilyMemberId): boolean {
    return gameState.rescuedFamily[familyMemberId];
}

export function markFamilyMemberRescued(familyMemberId: FamilyMemberId): void {
    gameState.rescuedFamily[familyMemberId] = true;
}

export function hasFoundPresent(): boolean {
    return gameState.hasFoundPresent;
}

export function markPresentFound(): void {
    gameState.hasFoundPresent = true;
}

export function getRescuedDogsCount(): number {
    return DOG_PET_IDS.filter((petId) => gameState.rescuedPets[petId]).length;
}

export function getRescuedCatsCount(): number {
    return CAT_PET_IDS.filter((petId) => gameState.rescuedPets[petId]).length;
}

export function getRescuedFamilyCount(): number {
    return FAMILY_MEMBER_IDS.filter((familyMemberId) => gameState.rescuedFamily[familyMemberId]).length;
}

export function resetGameState(): void {
    Object.assign(gameState, createInitialGameState());
}
