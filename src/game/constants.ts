export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const PLAYER_SPEED = 240;
export const PLAYER_JUMP_VELOCITY = -620;
export const PLAYER_VERTICAL_SPEED = 120;

export const DANUBIA_BASE_SCALE = 2;
export const DANUBIA_MIN_SCALE = 1.6;
export const DANUBIA_MAX_SCALE = 2.16;
export const DEBUG_ROOM_GEOMETRY = false;
export const DEV_SKIP_DIALOGUES = false;
export const UI_FONT_FAMILY = 'monospace';

export const ASSET_PATH = '/assets';

export const SCENE_KEYS = {
    boot: 'BootScene',
    menu: 'MenuScene',
    home: 'HomeScene',
    montmartre: 'MontmartreScene',
    seine: 'SeineScene',
    garden: 'GardenScene',
    workshop: 'WorkshopScene',
    ending: 'EndingScene',
} as const;
