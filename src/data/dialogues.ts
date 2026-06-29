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

export const montmartreArrivalDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Paris...',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Eu sempre quis voltar para cá, mas imaginava uma viagem com menos sequestros.',
        lockMovement: true,
    },
];

export const montmartrePudimRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Pudim!',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Um encontrado. Faltam... muitos.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
];

export const montmartreZoeRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Zoe?',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Você foi sequestrada e mesmo assim continua sem miar?',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Miau.',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Paris mexeu com você.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
];

export const montmartreDrogoBarrierDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Drogo, espera! Eu vou tirar você daí.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
];

export const montmartreDrogoRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Muito bem. Agora volte para casa e não tente matar nenhum outro animal.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
];

export const montmartreMonsieurFollowUpDialogue: DialogueSequence = [
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Interessante.',
        leftPortraitKey: 'danubia-portrait-normal',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Isso é elogio ou ameaça?',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Digamos que você está se saindo melhor do que o previsto.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Você previu mal. Eu tenho experiência com caos doméstico.',
        leftPortraitKey: 'danubia-portrait-happy',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Mesmo assim, não se anime tanto. Você recuperou apenas uma pequena parte do que te foi tirado.',
        leftPortraitKey: 'danubia-portrait-happy',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Então fala logo onde está o resto.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Seu próximo destino é o Sena.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Claro. Porque uma perseguição temporal em Paris precisava de passeio turístico.',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Bon voyage, Madame Danúbia.',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Eu odeio quando ele fala francês antes de desligar.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
];

export const seineArrivalDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Margem do Sena.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Tomara que ninguém espere que eu atravesse isso nadando.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
];

export const seinePirataRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Pirata em um barco.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Que ironia.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
];

export const seineBatataRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Batata...',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Você não tentou escapar. Você veio descansar dos seus filhotes..',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'bubble',
        text: 'Miau.',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Coitada.',
        portraitKey: 'danubia-portrait-angry',
        lockMovement: true,
    },
];

export const seinePitucaRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Pituca! Encontrei você.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Tá tudo bem, volte para casa.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
];

export const seineMonsieurFollowUpDialogue: DialogueSequence = [
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Você está procurando apenas quem desapareceu...',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: '...ou algo a mais?',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Por que você tenta a todo custo parecer filosófico?',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
];

export const gardenArrivalDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Esse lugar não tem uma cara boa.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Faltam só alguns animais.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
];

export const gardenEchoOneFeedbackDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'A prisão temporal parece ter ficado mais fraca.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
];

export const gardenEchoTwoFeedbackDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Quase lá.',
        portraitKey: 'danubia-portrait-angry',
        lockMovement: true,
    },
];

export const gardenEchoThreeFeedbackDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Agora sim!',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
];

export const gardenCollectiveRescueDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Brecko, Lelo e Purê...',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Os três juntos. É claro.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Eu deveria ter imaginado.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
];

export const gardenDoorBlockedDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Ainda há algo prendendo este lugar.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
];

export const gardenMonsieurCallDialogue: DialogueSequence = [
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Vejo que chegou ao meu jardim.',
        leftPortraitKey: 'danubia-portrait-normal',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Você está me vendo?',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Da janela da minha oficina. É uma vista excelente.',
        leftPortraitKey: 'danubia-portrait-sad',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Claro. Além de sequestrar minha família, ainda fica me observando.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'Venha em minha direção, Madame Danúbia.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Monsieur Minuit',
        text: 'O tempo está quase pronto para parar de vez.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'right',
        lockMovement: true,
    },
    {
        mode: 'phoneCall',
        speaker: 'Danúbia',
        text: 'Não se eu chegar antes que isso aconteça.',
        leftPortraitKey: 'danubia-portrait-angry',
        rightPortraitKey: 'monsieur-portrait-normal',
        rightPortraitSilhouette: true,
        activeSpeakerSide: 'left',
        lockMovement: true,
    },
];

export const workshopOpeningSceneBubbles = [
    {
        speakerId: 'danubia',
        text: 'Rodrigo? Rafa? Rô?!',
    },
    {
        speakerId: 'daughter',
        text: 'Mãe!',
    },
    {
        speakerId: 'son',
        text: 'Cuidado!',
    },
    {
        speakerId: 'husband',
        text: 'Amor!',
    },
    {
        speakerId: 'monsieur',
        text: 'Bienvenue, Madame Danúbia.',
    },
    {
        speakerId: 'danubia',
        text: 'Tá. Chega. Devolve minha família.',
    },
] as const;

export const workshopMainDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Passei a vida cercado por relógios... e todos eles me ensinaram a mesma crueldade.',
        portraitKey: 'monsieur-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Tudo o que é belo passa.',
        portraitKey: 'monsieur-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Um aniversário. Uma risada. Um abraço em família.',
        portraitKey: 'monsieur-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'São perfeitos justamente quando já estão indo embora.',
        portraitKey: 'monsieur-portrait-sad-01',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'E a sua solução foi sequestrar todo mundo?',
        portraitKey: 'danubia-portrait-angry',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Congelar. Preservar. Proteger do fim.',
        portraitKey: 'monsieur-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Você não protegeu nada.',
        portraitKey: 'danubia-portrait-angry',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Você arrancou a vida deles.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Momento feliz não vale porque dura pra sempre.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Vale porque a gente vive... e depois vive outro.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rodrigo',
        text: 'Danúbia, estamos bem!',
        portraitKey: 'family-husband-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rafa',
        text: 'Mãe, não deixa ele fazer isso de novo!',
        portraitKey: 'family-daughter-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rô',
        text: 'Tem alguma coisa prendendo essa bolha!',
        portraitKey: 'family-son-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Se deseja levá-los... prove que aceita o movimento do tempo.',
        portraitKey: 'monsieur-portrait-angry',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Enfrente a minha oficina.',
        portraitKey: 'monsieur-portrait-angry',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Com prazer.',
        portraitKey: 'danubia-portrait-angry',
        lockMovement: true,
    },
] as const;

export const workshopEndingDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Eu só queria preservar o instante perfeito...',
        portraitKey: 'monsieur-portrait-sad-01',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Antes que ele desaparecesse.',
        portraitKey: 'monsieur-portrait-sad-01',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Mas um momento parado não é um momento vivido.',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Ele importa porque passa.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Porque depois dele vêm outros.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rodrigo',
        text: 'E a gente vive todos juntos.',
        portraitKey: 'family-husband-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rafa',
        text: 'Mesmo os bagunçados.',
        portraitKey: 'family-daughter-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rô',
        text: 'Principalmente os bagunçados.',
        portraitKey: 'family-son-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Então... talvez o tempo não roube os momentos.',
        portraitKey: 'monsieur-portrait-sad-01',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Monsieur Minuit',
        text: 'Talvez ele só abra espaço para os próximos.',
        portraitKey: 'monsieur-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Agora você entendeu.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
] as const;

export const endingLivingRoomDialogue: DialogueSequence = [
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Então acabou?',
        portraitKey: 'danubia-portrait-normal',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rodrigo',
        text: 'Acabou.',
        portraitKey: 'family-husband-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rô',
        text: 'Pelo menos até alguém inventar outro portal estranho.',
        portraitKey: 'family-son-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rafa',
        text: 'Por favor, hoje não.',
        portraitKey: 'family-daughter-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Eu só queria um aniversário normal.',
        portraitKey: 'danubia-portrait-sad',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rodrigo',
        text: 'Com a nossa família?',
        portraitKey: 'family-husband-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rafa',
        text: 'Com cachorro, gato, susto e confusão?',
        portraitKey: 'family-daughter-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rô',
        text: 'Isso já é o normal.',
        portraitKey: 'family-son-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'É... acho que é mesmo.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'E quer saber?',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Danúbia',
        text: 'Eu não trocaria por nenhum momento congelado.',
        portraitKey: 'danubia-portrait-happy',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rodrigo',
        text: 'Nem a gente.',
        portraitKey: 'family-husband-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rafa',
        text: 'Feliz aniversário, mãe.',
        portraitKey: 'family-daughter-portrait',
        lockMovement: true,
    },
    {
        mode: 'portrait',
        speaker: 'Rô',
        text: 'Feliz aniversário!',
        portraitKey: 'family-son-portrait',
        lockMovement: true,
    },
] as const;
