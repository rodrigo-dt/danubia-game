import type { DialogueSequence } from '../game/types';

export const homeOpeningDialogue: DialogueSequence = [
    {
        mode: 'narration',
        text: '29 de junho de 2026.',
        lockMovement: true,
    },
    {
        mode: 'narration',
        text: 'No aniversário de Danúbia, algo muito estranho aconteceu.',
        lockMovement: true,
    },
    {
        mode: 'narration',
        text: 'Todo mundo desapareceu.',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Gente?',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Rafa? Drogo? Alguém?',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Nove animais nessa casa e nenhum barulho.',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Ou eu ainda estou dormindo... ou aconteceu alguma coisa muito séria.',
        lockMovement: true,
    },
];

export const homeRoomEntryDialogues: Partial<Record<'hall' | 'son-bedroom' | 'daughter-bedroom' | 'office', DialogueSequence>> = {
    hall: [
        {
            mode: 'portrait',
            speaker: 'Danúbia',
            text: 'Tá. Vamos por partes.',
            portraitKey: 'danubia-portrait-normal',
            lockMovement: true,
        },
        {
            mode: 'portrait',
            speaker: 'Danúbia',
            text: 'Se isso for uma surpresa de aniversário, ela está ficando muito elaborada.',
            portraitKey: 'danubia-portrait-sad',
            lockMovement: true,
        },
    ],
    'son-bedroom': [
        {
            mode: 'portrait',
            speaker: 'Danúbia',
            text: 'Ele não está aqui.',
            portraitKey: 'danubia-portrait-sad',
            lockMovement: true,
        },
        {
            mode: 'bubble',
            text: 'Pelo menos tentou arrumar o quarto antes de desaparecer.',
            lockMovement: false,
        },
    ],
    'daughter-bedroom': [
        {
            mode: 'portrait',
            speaker: 'Danúbia',
            text: 'Também sumiu...',
            portraitKey: 'danubia-portrait-sad',
            lockMovement: true,
        },
        {
            mode: 'portrait',
            speaker: 'Danúbia',
            text: 'Certo. Agora isso definitivamente virou uma missão!',
            portraitKey: 'danubia-portrait-angry',
            lockMovement: true,
        },
    ],
    office: [
        {
            mode: 'portrait',
            speaker: 'Danúbia',
            text: 'Ele não está aqui.',
            portraitKey: 'danubia-portrait-sad',
            lockMovement: true,
        },
        {
            mode: 'bubble',
            text: 'Pronto. Quis sumir logo no meu aniversário. Impressionante....',
            lockMovement: false,
        },
    ],
};

export const livingRoomInteractionDialogues: Partial<Record<
    'sofa' | 'bowls' | 'clock',
    DialogueSequence
>> = {
    sofa: [
        {
            mode: 'bubble',
            text: 'O Drogo não tá no sofá. Isso já é suspeito.',
            lockMovement: false,
        },
    ],
};

export const homeRoomInteractionDialogues: Record<
    'son-bedroom-desk' | 'daughter-bedroom-style' | 'office-desk',
    DialogueSequence
> = {
    'son-bedroom-desk': [
        {
            mode: 'bubble',
            text: 'O computador tá ligado. Isso é suspeito.',
            lockMovement: false,
        },
        {
            mode: 'bubble',
            text: 'Ou normal. Difícil saber.',
            lockMovement: false,
        },
    ],
    'daughter-bedroom-style': [
        {
            mode: 'bubble',
            text: 'Tudo no lugar... mais ou menos.',
            lockMovement: false,
        },
        {
            mode: 'bubble',
            text: 'Se ela sumiu, tomara que tenha levado algum photocard junto.',
            lockMovement: false,
        },
    ],
    'office-desk': [
        {
            mode: 'bubble',
            text: 'Nada aqui explica o desaparecimento.',
            lockMovement: false,
        },
        {
            mode: 'bubble',
            text: 'Mas esse silêncio tá ficando cada vez mais estranho.',
            lockMovement: false,
        },
    ],
};

const MYSTERIOUS_CALLER_NAME = '????';
const MYSTERIOUS_CALLER_PORTRAIT = 'monsieur-portrait-normal';

export const firstMonsieurCallDialogue: DialogueSequence = [
    {
        mode: 'phoneCall',
        speaker: MYSTERIOUS_CALLER_NAME,
        text: 'Bon anniversaire, Madame Danubia.',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Quem é você?',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: MYSTERIOUS_CALLER_NAME,
        text: 'Alguém que sabe reconhecer um momento perfeito.',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Você sabe onde está minha família?',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: MYSTERIOUS_CALLER_NAME,
        text: 'Digamos que eles estão... preservados.',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Preservados? Isso é jeito bonito de falar sequestrados?',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: MYSTERIOUS_CALLER_NAME,
        text: '"Sequestro" é uma palavra bastante deselegante.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'É sério isso? No meu aniversário?',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: MYSTERIOUS_CALLER_NAME,
        text: 'Venha até Paris. Seus fragmentos abrirão o caminho.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Você sequestra minha família e ainda quer que eu vá até Paris?',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: MYSTERIOUS_CALLER_NAME,
        text: 'Tecnicamente... sim.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Tá bom. Estou indo.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Pelo menos é Paris.',
        leftPortraitKey: 'danubia-portrait-normal',
        rightPortraitKey: MYSTERIOUS_CALLER_PORTRAIT,
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
];
