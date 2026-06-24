export type Point2D = {
    x: number;
    y: number;
};

export type RectArea = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type HomeRoomId =
    | 'living-room'
    | 'hall'
    | 'son-bedroom'
    | 'daughter-bedroom'
    | 'office';

export type RoomBlocker = RectArea & {
    id: string;
};

export type RoomDoor = RectArea & {
    id: string;
    targetRoom: HomeRoomId;
    targetSpawn: Point2D;
    targetFacing?: 'left' | 'right';
    promptText: string;
};

export type RoomInteraction = RectArea & {
    id: string;
    promptText: string;
};

export type FragmentId =
    | 'home-fragment-son-bedroom'
    | 'home-fragment-daughter-bedroom'
    | 'home-fragment-office';

export type RoomFragment = RectArea & {
    id: FragmentId;
    assetKey: string;
    spriteX: number;
    spriteY: number;
    promptText: string;
};

export type WalkArea = RectArea & {
    baseScaleY: number;
};

export type DepthScaleConfig = {
    farY?: number;
    nearY?: number;
    baseY?: number;
    baseScale?: number;
    farScale?: number;
    nearScale?: number;
    intensity?: number;
};

export type CharacterShadowConfig = {
    enabled?: boolean;
    offsetX?: number;
    offsetY?: number;
    width?: number;
    height?: number;
    alpha?: number;
    color?: number;
    scaleWithDepth?: boolean;
    minScaleMultiplier?: number;
    maxScaleMultiplier?: number;
    shrinkOnJump?: boolean;
    jumpShrinkFactor?: number;
    fadeOnJump?: boolean;
    jumpFadeFactor?: number;
};

export type HomeRoomConfig = {
    id: HomeRoomId;
    backgroundKey: string;
    playerSpawn: Point2D;
    walkArea: WalkArea;
    blockers: RoomBlocker[];
    doors: RoomDoor[];
    interactions?: RoomInteraction[];
    fragments?: RoomFragment[];
    depthScale: DepthScaleConfig;
    shadow?: CharacterShadowConfig;
};

export type DialogueLine = {
    mode: 'narration' | 'portrait' | 'bubble' | 'phoneCall';
    speaker?: string;
    text: string;
    portraitKey?: string;
    lockMovement?: boolean;
    leftPortraitKey?: string;
    rightPortraitKey?: string;
    leftPortraitSilhouette?: boolean;
    rightPortraitSilhouette?: boolean;
    activeSpeakerSide?: 'left' | 'right';
};

export type DialogueSequence = DialogueLine[];
