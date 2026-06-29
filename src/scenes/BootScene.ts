import Phaser from 'phaser';
import { ASSET_PATH, SCENE_KEYS } from '../game/constants';
import { getInitialSceneTarget } from '../game/devMode';
import { DANUBIA_ASSET_KEYS } from '../characters/Danubia';
import { homeRoomBackgroundPaths, homeRooms } from '../data/homeRooms';

const ASSET_KEYS = {
    cover: 'bg-cover',
    clockFragment01: 'clock-fragment-01',
    clockFragment02: 'clock-fragment-02',
    clockFragment03: 'clock-fragment-03',
    homePortal: 'effect-time-portal',
    bgParisMontmartreA: 'bg-paris-montmartre-a',
    bgParisMontmartreB: 'bg-paris-montmartre-b',
    bgParisSeine: 'bg-paris-seine',
    bgParisGarden: 'bg-paris-garden',
    bgParisWorkshop: 'bg-paris-workshop',
} as const;

export class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.boot);
    }

    preload(): void {
        this.load.image(ASSET_KEYS.cover, `${ASSET_PATH}/backgrounds/cover.png`);
        this.load.image(ASSET_KEYS.clockFragment01, `${ASSET_PATH}/effects/clock-fragment-01.png`);
        this.load.image(ASSET_KEYS.clockFragment02, `${ASSET_PATH}/effects/clock-fragment-02.png`);
        this.load.image(ASSET_KEYS.clockFragment03, `${ASSET_PATH}/effects/clock-fragment-03.png`);
        this.load.image(ASSET_KEYS.homePortal, `${ASSET_PATH}/effects/effect-time-portal.png`);
        this.load.image('effect-time-bubble', `${ASSET_PATH}/effects/effect-time-bubble.png`);
        this.load.image('effect-time-barrier', `${ASSET_PATH}/effects/effect-time-barrier.png`);
        this.load.image('effect-time-anchor', `${ASSET_PATH}/effects/effect-time-anchor.png`);
        this.load.image('effect-time-switch', `${ASSET_PATH}/effects/effect-time-switch.png`);
        this.load.image('effect-time-golden-pulse', `${ASSET_PATH}/effects/effect-time-golden-pulse.png`);
        this.load.image(ASSET_KEYS.bgParisMontmartreA, `${ASSET_PATH}/backgrounds/bg-paris-montmartre-a.png`);
        this.load.image(ASSET_KEYS.bgParisMontmartreB, `${ASSET_PATH}/backgrounds/bg-paris-montmartre-b.png`);
        this.load.image(ASSET_KEYS.bgParisSeine, `${ASSET_PATH}/backgrounds/bg-paris-seine.png`);
        this.load.image(ASSET_KEYS.bgParisGarden, `${ASSET_PATH}/backgrounds/bg-paris-garden.png`);
        this.load.image(ASSET_KEYS.bgParisWorkshop, `${ASSET_PATH}/backgrounds/bg-paris-workshop.png`);
        this.load.image('ui-dialogue-frame', `${ASSET_PATH}/ui/ui-dialogue-frame.png`);
        this.load.image('ui-phone-compact', `${ASSET_PATH}/ui/ui-phone-compact.png`);
        this.load.image('ui-phone-expanded', `${ASSET_PATH}/ui/ui-phone-expanded.png`);
        this.load.image(
            'danubia-portrait-normal',
            `${ASSET_PATH}/characters/danubia/portrait/danubia-portrait-normal.png`,
        );
        this.load.image(
            'danubia-portrait-happy',
            `${ASSET_PATH}/characters/danubia/portrait/danubia-portrait-happy.png`,
        );
        this.load.image(
            'danubia-portrait-angry',
            `${ASSET_PATH}/characters/danubia/portrait/danubia-portrait-angry.png`,
        );
        this.load.image(
            'danubia-portrait-sad',
            `${ASSET_PATH}/characters/danubia/portrait/danubia-portrait-sad.png`,
        );
        this.load.image(
            'monsieur-portrait-normal',
            `${ASSET_PATH}/characters/monsieur-minuit/portraits/monsieur-portrait-normal.png`,
        );
        this.load.image(
            'monsieur-portrait-angry',
            `${ASSET_PATH}/characters/monsieur-minuit/portraits/monsieur-portrait-angry.png`,
        );
        this.load.image(
            'monsieur-portrait-sad-01',
            `${ASSET_PATH}/characters/monsieur-minuit/portraits/monsieur-portrait-sad-01.png`,
        );
        this.load.image(
            'monsieur-idle',
            `${ASSET_PATH}/characters/monsieur-minuit/monsieur-idle.png`,
        );
        this.load.image(
            'monsieur-gesture-01',
            `${ASSET_PATH}/characters/monsieur-minuit/gesture/monsieur-gesture-01.png`,
        );
        this.load.image(
            'monsieur-gesture-02',
            `${ASSET_PATH}/characters/monsieur-minuit/gesture/monsieur-gesture-02.png`,
        );
        this.load.image(
            'monsieur-watch-01',
            `${ASSET_PATH}/characters/monsieur-minuit/watch/monsieur-watch-01.png`,
        );
        this.load.image(
            'monsieur-watch-02',
            `${ASSET_PATH}/characters/monsieur-minuit/watch/monsieur-watch-02.png`,
        );
        this.load.image(
            'family-husband',
            `${ASSET_PATH}/characters/family/husband.png`,
        );
        this.load.image(
            'family-husband-portrait',
            `${ASSET_PATH}/characters/family/husband-portrait.png`,
        );
        this.load.image(
            'family-daughter',
            `${ASSET_PATH}/characters/family/daughter.png`,
        );
        this.load.image(
            'family-daughter-portrait',
            `${ASSET_PATH}/characters/family/daughter-portrait.png`,
        );
        this.load.image(
            'family-son',
            `${ASSET_PATH}/characters/family/son.png`,
        );
        this.load.image(
            'family-son-portrait',
            `${ASSET_PATH}/characters/family/son-portrait.png`,
        );
        this.load.image('hazard-gear', `${ASSET_PATH}/hazards/hazard-gear.png`);
        this.load.image('hazard-clock-hand', `${ASSET_PATH}/hazards/hazard-clock-hand.png`);
        this.load.image('hazard-alarm-clock', `${ASSET_PATH}/hazards/hazard-alarm-clock.png`);
        this.load.image('hazard-calendar', `${ASSET_PATH}/hazards/hazard-calendar.png`);
        this.load.image('hazard-meeting', `${ASSET_PATH}/hazards/hazard-meeting.png`);
        this.load.image('hazard-cloud', `${ASSET_PATH}/hazards/hazard-cloud.png`);
        this.load.image('pet-pudim', `${ASSET_PATH}/characters/pets/pudim.png`);
        this.load.image('pet-zoe', `${ASSET_PATH}/characters/pets/zoe.png`);
        this.load.image('pet-drogo', `${ASSET_PATH}/characters/pets/drogo.png`);
        this.load.image('pet-pirata', `${ASSET_PATH}/characters/pets/pirata.png`);
        this.load.image('pet-batata', `${ASSET_PATH}/characters/pets/batata.png`);
        this.load.image('pet-pituca', `${ASSET_PATH}/characters/pets/pituca.png`);
        this.load.image('pet-brecko-lelo-pure', `${ASSET_PATH}/characters/pets/brecko-lelo-pure.png`);

        for (const roomId of Object.keys(homeRooms) as Array<keyof typeof homeRooms>) {
            const room = homeRooms[roomId];
            this.load.image(room.backgroundKey, homeRoomBackgroundPaths[roomId]);
        }

        this.load.image(
            DANUBIA_ASSET_KEYS.idle,
            `${ASSET_PATH}/characters/danubia/danubia-idle.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.jump,
            `${ASSET_PATH}/characters/danubia/danubia-jump.png`,
        );
        this.load.image(
            'danubia-power-01',
            `${ASSET_PATH}/characters/danubia/power/danubia-power-01.png`,
        );
        this.load.image(
            'danubia-power-02',
            `${ASSET_PATH}/characters/danubia/power/danubia-power-02.png`,
        );
        this.load.image(
            'danubia-victory',
            `${ASSET_PATH}/characters/danubia/danubia-victory.png`,
        );
        this.load.image(
            'monsieur-defeated',
            `${ASSET_PATH}/characters/monsieur-minuit/monsieur-defeated.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk01,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-01.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk02,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-02.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk03,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-03.png`,
        );
        this.load.image(
            DANUBIA_ASSET_KEYS.walk04,
            `${ASSET_PATH}/characters/danubia/walk/danubia-walk-04.png`,
        );
    }

    create(): void {
        if (!this.anims.exists(DANUBIA_ASSET_KEYS.walkAnimation)) {
            this.anims.create({
                key: DANUBIA_ASSET_KEYS.walkAnimation,
                frames: [
                    { key: DANUBIA_ASSET_KEYS.walk01 },
                    { key: DANUBIA_ASSET_KEYS.walk02 },
                    { key: DANUBIA_ASSET_KEYS.walk03 },
                    { key: DANUBIA_ASSET_KEYS.walk04 },
                ],
                frameRate: 8,
                repeat: -1,
            });
        }

        const initialTarget = getInitialSceneTarget();
        this.scene.start(initialTarget.sceneKey, initialTarget.data);
    }
}
