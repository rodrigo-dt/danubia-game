# GAME_DESIGN

Atualizado em: 2026-06-21

## 1. Visão geral

**Título do jogo:** Danubia em: O aniversario que todo mundo desapareceu  
**Gênero:** aventura 2D em pixel art com plataforma leve, diálogos, exploração curta e confronto final não violento.  
**Duração alvo:** 10 a 15 minutos.  
**Tom:** engraçado, familiar, carinhoso e levemente misterioso.  
**Objetivo narrativo:** Danubia precisa descobrir por que sua família e seus animais desapareceram no dia do aniversário dela, atravessar Paris, resgatar todos e entender que momentos especiais não precisam ficar congelados para serem importantes.

## 2. Regras de escopo

Este jogo deve permanecer pequeno. A prioridade é terminar uma experiência jogável, bonita e emocionalmente funcional.

### Fazer

- Usar os assets existentes em `public/assets`.
- Criar cenas curtas com backgrounds fixos.
- Usar colisões invisíveis sobre os backgrounds.
- Usar diálogos para carregar a personalidade e a história.
- Usar animações por código sempre que possível: piscar, flutuar, tremer, girar, escalar, tint, fade e partículas simples.
- Reaproveitar sprites estáticas para estados congelados, libertados e cena final.

### Não fazer

- Não criar fases longas.
- Não criar combate físico.
- Não exigir precisão difícil de plataforma.
- Não criar novos sistemas complexos.
- Não depender de assets que ainda não existem.
- Não renomear os assets durante a implementação inicial.

## 3. Resolução e estilo

| Item | Valor |
|---|---:|
| Resolução interna | 960 × 540 |
| Proporção | 16:9 |
| Sprites de personagens | 128 × 128 |
| Backgrounds | 960 × 540 |
| Engine | Phaser 3 |
| Física | Arcade Physics |
| Renderização | Pixel art, sem suavização |

## 4. Controles

| Ação | Controle PlayStation | Teclado |
|---|---|---|
| Andar | Analógico esquerdo / direcional | `A/D` ou setas |
| Pular | `X` | `Espaço` |
| Interagir / avançar diálogo | `Quadrado` | `E` |
| Poder temporal | `Círculo` | `F` |
| Abrir celular/checklist | Touchpad / Select | `Tab` |
| Pausar | Options | `Esc` |

Os comandos devem aparecer como pequenos popups contextuais, somente quando a ação for necessária.

## 5. Estado global do jogo

O estado deve ser simples e serializável em `localStorage`.

```ts
type GameProgress = {
  checkpoint: 'home' | 'paris-montmartre' | 'paris-seine' | 'paris-garden' | 'workshop' | 'ending';
  collectedFragments: number;
  rescuedPets: {
    pudim: boolean;
    zoe: boolean;
    drogo: boolean;
    pirata: boolean;
    batata: boolean;
    pituca: boolean;
    brecko: boolean;
    lelo: boolean;
    pure: boolean;
  };
  rescuedFamily: {
    son: boolean;
    daughter: boolean;
    husband: boolean;
  };
  hasTemporalPower: boolean;
  lives: number;
};
```

## 6. HUD e checklist

### HUD compacto

O HUD compacto aparece durante o gameplay.

Assets usados:

| Elemento | Asset |
|---|---|
| Celular compacto | `public/assets/ui/ui-phone-compact.png` |
| Ícone de gato | `public/assets/ui/ui-icon-cat.png` |
| Ícone de cachorro | `public/assets/ui/ui-icon-dog.png` |
| Ícone de família | `public/assets/ui/ui-icon-family.png` |
| Coração | `public/assets/ui/ui-icon-heart.png` |

Exibição recomendada:

```text
🐱 0/6   🐶 0/3   👨‍👩‍👧‍👦 0/3
```

No jogo, use os ícones do asset em vez de emojis. Os números são renderizados por texto.

### Checklist expandida

A checklist aparece dentro do celular expandido.

Asset usado:

```text
public/assets/ui/ui-phone-expanded.png
```

Conteúdo renderizado por código:

```text
DESAPARECIDOS

Cachorros
[ ] Pudim
[ ] Drogo
[ ] Pirata

Gatos
[ ] Zoe
[ ] Batata
[ ] Pituca
[ ] Brecko
[ ] Lelo
[ ] Pure

Família
[ ] Filho
[ ] Filha
[ ] Marido

Presente
[ ] ???
```

A checklist deve abrir ao apertar `Tab` ou Touchpad/Select. Ao resgatar alguém, ela aparece automaticamente por 2 segundos com o novo item marcado.

## 7. Sistema de diálogos

Assets usados:

| Elemento | Asset |
|---|---|
| Moldura/caixa de diálogo | `public/assets/ui/ui-dialogue-frame.png` |
| Retratos Danubia | `public/assets/characters/danubia/portrait/*.png` |
| Retratos Monsieur | `public/assets/characters/monsieur-minuit/portraits/*.png` |
| Retratos família | `public/assets/characters/family/*-portrait.png` |

### Regras

- Durante diálogos, a movimentação da protagonista deve pausar.
- O jogador avança com `Quadrado` ou `E`.
- O texto deve aparecer rápido; não usar efeito de digitação lento demais.
- O sistema deve aceitar falas sem retrato para mensagens narrativas ou do celular.
- Os diálogos devem ficar em arquivos de dados, não hardcoded dentro das cenas quando possível.

## 8. Checkpoints e falha

Checkpoints:

| Checkpoint | Quando salva |
|---|---|
| `home` | Ao iniciar o jogo |
| `paris-montmartre` | Após atravessar o portal |
| `paris-seine` | Após resgatar Pudim, Zoe e Drogo |
| `paris-garden` | Após resgatar Pirata, Batata e Pituca |
| `workshop` | Após resgatar Brecko, Lelo e Pure |
| `ending` | Após libertar a família |

Falha:

- O jogo não deve ter Game Over definitivo.
- Ao perder todos os corações, Danubia retorna ao último checkpoint.
- A mensagem deve ser leve:

```text
Ops! Nem toda missão funciona na primeira tentativa.
```

## 9. Assets reais disponíveis

Este roteiro considera somente os assets já existentes.

### Backgrounds

| Cena | Asset |
|---|---|
| Capa/Menu | `public/assets/backgrounds/cover.png` |
| Sala | `public/assets/backgrounds/bg-home-living-room.png` |
| Corredor | `public/assets/backgrounds/bg-home-hall.png` |
| Quarto do filho | `public/assets/backgrounds/bg-home-son-bedroom.png` |
| Quarto da filha | `public/assets/backgrounds/bg-home-daughter-bedroom.png` |
| Escritório | `public/assets/backgrounds/bg-home-office.png` |
| Montmartre | `public/assets/backgrounds/bg-paris-montmartre.png` |
| Sena | `public/assets/backgrounds/bg-paris-seine.png` |
| Jardim | `public/assets/backgrounds/bg-paris-garden.png` |
| Oficina | `public/assets/backgrounds/bg-paris-workshop.png` |

### Personagens principais

| Personagem | Assets |
|---|---|
| Danubia | `danubia-idle.png`, `danubia-jump.png`, `danubia-damage.png`, `danubia-victory.png`, `walk/danubia-walk-01..04.png`, `power/danubia-power-01..02.png` |
| Monsieur Minuit | `monsieur-idle.png`, `monsieur-defeated.png`, `gesture/monsieur-gesture-01..02.png`, `watch/monsieur-watch-01..02.png` |
| Filho | `characters/family/son.png`, `son-portrait.png` |
| Filha | `characters/family/daughter.png`, `daughter-portrait.png` |
| Marido | `characters/family/husband.png`, `husband-portrait.png` |

### Animais

| Animal | Asset |
|---|---|
| Pudim | `public/assets/characters/pets/pudim.png` |
| Zoe | `public/assets/characters/pets/zoe.png` |
| Drogo | `public/assets/characters/pets/drogo.png` |
| Pirata | `public/assets/characters/pets/pirata.png` |
| Batata | `public/assets/characters/pets/batata.png` |
| Pituca | `public/assets/characters/pets/pituca.png` |
| Brecko, Lelo e Pure | `public/assets/characters/pets/brecko-lelo-pure.png` |

Brecko, Lelo e Pure aparecem como sprite agrupada. A checklist marca os três separadamente, mas em tela o resgate é coletivo.

### Efeitos

| Elemento | Asset |
|---|---|
| Fragmentos | `clock-fragment-01.png`, `clock-fragment-02.png`, `clock-fragment-03.png` |
| Relógio completo | `effect-clock-complete.png` |
| Portal | `effect-time-portal.png` |
| Bolha temporal | `effect-time-bubble.png` |
| Barreira | `effect-time-barrier.png` |
| Interruptor temporal | `effect-time-switch.png` |
| Âncora temporal | `effect-time-anchor.png` |
| Pulso temporal | `effect-time-golden-pulse.png` |

### Obstáculos finais

| Obstáculo | Asset |
|---|---|
| Despertador | `hazard-alarm-clock.png` |
| Calendário | `hazard-calendar.png` |
| Ponteiro | `hazard-clock-hand.png` |
| Nuvem | `hazard-cloud.png` |
| Engrenagem | `hazard-gear.png` |
| Reunião | `hazard-meeting.png` |

---

# 10. Estrutura de cenas

## 10.1 BootScene

### Função

Carregar assets, configurar animações globais e iniciar o menu.

### Assets carregados

Todos os assets listados neste documento devem ser carregados aqui ou em preloads por cena.

### Animações globais

Criar no boot:

```text
danubia-walk
danubia-power
monsieur-gesture
monsieur-watch
```

Para idle, usar frame único:

```text
danubia-idle
monsieur-idle
```

### Saída

Após carregar, iniciar `MenuScene`.

---

## 10.2 MenuScene — Capa

### Background

```text
public/assets/backgrounds/cover.png
```

### Propósito narrativo

Apresentar o jogo como uma aventura de aniversário.

### Como acontece

A tela exibe a capa em tela cheia. O título já está integrado à imagem ou pode ser reforçado pelo código se necessário.

Texto de menu renderizado por código:

```text
Pressione X ou Espaço para começar
```

Texto secundário opcional:

```text
Use controle de PlayStation ou teclado
```

### Mecânicas

- `X` ou `Espaço`: começa o jogo.
- `Options` ou `Esc`: não faz nada no menu inicial.
- Ao começar, fazer fade para preto e iniciar `HomeScene` na sala.

### Personagens

Nenhum sprite separado precisa aparecer. A capa já contém Danubia.

### Saída

Iniciar `HomeScene` com localização inicial `living-room`.

---

# 11. HomeScene — Casa vazia

A casa será uma única Phaser Scene com troca de background interna. Não é necessário criar uma Scene separada para cada cômodo.

## 11.1 Locais internos

| Local lógico | Background |
|---|---|
| `living-room` | `bg-home-living-room.png` |
| `hall` | `bg-home-hall.png` |
| `son-bedroom` | `bg-home-son-bedroom.png` |
| `daughter-bedroom` | `bg-home-daughter-bedroom.png` |
| `office` | `bg-home-office.png` |

## 11.2 Personagens e sprites

| Personagem | Asset |
|---|---|
| Danubia | `danubia-idle.png`, walk, jump |
| Monsieur Minuit | retratos em diálogos e/ou `monsieur-idle.png` como projeção |
| Nenhum familiar | família ainda está desaparecida |
| Nenhum animal | animais ainda estão desaparecidos |

## 11.3 Efeitos usados

| Efeito | Asset |
|---|---|
| Fragmento 1 | `clock-fragment-01.png` |
| Fragmento 2 | `clock-fragment-02.png` |
| Fragmento 3 | `clock-fragment-03.png` |
| Relógio completo | `effect-clock-complete.png` |
| Portal | `effect-time-portal.png` |

## 11.4 Mecânicas da casa

### Movimento

Danubia pode andar para os lados e pular. A fase não exige plataforma difícil. O pulo existe para ensinar o controle.

### Interação

Objetos e portas possuem zonas invisíveis. Ao se aproximar, aparece:

```text
Pressione Quadrado / E para interagir
```

### Troca de cômodo

Entrar em uma porta faz:

1. fade curto para preto;
2. troca do background;
3. reposicionamento de Danubia perto da porta;
4. fade de volta.

### Fragmentos

Cada fragmento fica parado e flutuando levemente por tween. Ao coletar:

1. tocar efeito visual simples;
2. esconder fragmento;
3. incrementar `collectedFragments`;
4. mostrar mensagem curta.

## 11.5 Sala

### Background

```text
public/assets/backgrounds/bg-home-living-room.png
```

### Início

Tela escura com texto:

```text
29 de junho de 2026.
```

Depois:

```text
No aniversário de Danúbia, algo muito estranho aconteceu.
```

Depois:

```text
Todo mundo desapareceu.
```

Fade para a sala. Danubia aparece no centro.

### Diálogo inicial

**Danubia normal:**

```text
Gente?
```

**Danubia preocupada/triste:**

```text
Drogo? Pituca? Alguém?
```

**Danubia irritada:**

```text
Nove animais nessa casa e nenhum barulho.
```

**Danubia normal:**

```text
Ou eu ainda estou dormindo... ou aconteceu alguma coisa muito séria.
```

### Tutorial contextual

Após o diálogo:

```text
Use o analógico ou as setas para andar.
```

Ao se aproximar da saída para o corredor:

```text
Pressione Quadrado / E para interagir.
```

### Interações opcionais

Sofá:

```text
Nem sinal dos gatos no sofá. Isso já é suspeito.
```

Potes dos animais:

```text
Os potes estão cheios. Então eles não sumiram por causa de comida.
Pela primeira vez.
```

Relógio da sala:

```text
Esse relógio está parado?
```

### Saída

Interagir com a passagem da esquerda troca para `hall`.

---

## 11.6 Corredor

### Background

```text
public/assets/backgrounds/bg-home-hall.png
```

### Propósito

Funcionar como hub da casa.

### Portas

| Porta | Destino |
|---|---|
| Quarto do filho | `son-bedroom` |
| Quarto da filha | `daughter-bedroom` |
| Escritório | `office` |
| Sala | `living-room` |

### Diálogo ao entrar pela primeira vez

**Danubia normal:**

```text
Tá. Vamos por partes.
```

**Danubia irritada:**

```text
Se isso for uma surpresa de aniversário, ela está ficando muito elaborada.
```

### Mecânica

- O jogador escolhe a ordem dos quartos.
- A porta do escritório pode ser acessada antes, mas o portal só abre depois dos três fragmentos.

---

## 11.7 Quarto do filho

### Background

```text
public/assets/backgrounds/bg-home-son-bedroom.png
```

### Personagens

| Personagem | Asset |
|---|---|
| Danubia | gameplay |

### Objeto principal

| Objeto | Asset |
|---|---|
| Fragmento 1 | `clock-fragment-01.png` |

### Como acontece

O fragmento aparece próximo à cama ou escrivaninha, flutuando.

### Diálogo ao entrar

**Danubia normal:**

```text
Ele não está aqui.
```

**Danubia irritada:**

```text
E nem arrumou o quarto antes de desaparecer. Interessante.
```

### Ao coletar o fragmento

```text
Fragmento de tempo encontrado: 1/3
```

### Saída

Voltar pela porta para `hall`.

---

## 11.8 Quarto da filha

### Background

```text
public/assets/backgrounds/bg-home-daughter-bedroom.png
```

### Objeto principal

| Objeto | Asset |
|---|---|
| Fragmento 2 | `clock-fragment-02.png` |

### Diálogo ao entrar

**Danubia preocupada/triste:**

```text
Também sumiu...
```

**Danubia normal:**

```text
Certo. Agora isso definitivamente virou uma missão.
```

### Ao coletar o fragmento

```text
Fragmento de tempo encontrado: 2/3
```

### Saída

Voltar para `hall`.

---

## 11.9 Escritório

### Background

```text
public/assets/backgrounds/bg-home-office.png
```

### Objeto principal

| Objeto | Asset |
|---|---|
| Fragmento 3 | `clock-fragment-03.png` |

### Diálogo ao entrar

**Danubia normal:**

```text
Ele também não está aqui.
```

**Danubia irritada:**

```text
Pronto. Sumiu todo mundo no meu aniversário.
```

### Ao coletar o fragmento

```text
Fragmento de tempo encontrado: 3/3
```

Os três fragmentos se movem até o centro da tela e formam o relógio completo.

Mostrar:

```text
Os fragmentos começaram a girar...
```

O celular toca.

### Ligação de Monsieur Minuit

Após coletar os três fragmentos, antes do portal, o celular expandido deve aparecer na tela com animação de vibração e prompt para aceitar a ligação. Não há opção de recusar.

Na primeira ligação, a identidade de Monsieur Minuit ainda não deve ser revelada.

Usar retratos:

| Personagem | Retrato |
|---|---|
| Danubia normal | `danubia-portrait-normal.png` |
| Danubia triste/preocupada | `danubia-portrait-sad.png` |
| Danubia irritada | `danubia-portrait-angry.png` |
| Interlocutor misterioso | `monsieur-portrait-normal.png` com silhueta preta por código |

Diálogo:

**????:**

```text
Bon anniversaire, Madame Danubia.
```

**Danubia:**

```text
Quem é você?
```

**????:**

```text
Alguém que sabe reconhecer um momento perfeito.
```

**Danubia:**

```text
Você sabe onde está minha família?
```

**????:**

```text
Digamos que eles estão... preservados.
```

**Danubia irritada:**

```text
Preservados? Isso é jeito bonito de falar sequestrados?
```

**????:**

```text
"Sequestro" é uma palavra bastante deselegante.
```

**Danubia irritada:**

```text
É sério isso? No meu aniversário?
```

**????:**

```text
Venha até Paris. Seus fragmentos abrirão o caminho.
```

**Danubia irritada:**

```text
Você sequestra minha família e ainda quer que eu vá até Paris?
```

**????:**

```text
Tecnicamente... sim.
```

**Danubia irritada:**

```text
Tá bom. Estou indo.
```

**Danubia normal:**

```text
Tá bom. Estou indo.
```

Após a ligação:

**Danubia normal:**

```text
Pelo menos é Paris.
```

### Portal

Criar `effect-time-portal.png` no mesmo cômodo onde o terceiro fragmento foi coletado, surgindo perto da Danubia no mesmo nível dos pés. Se ela estiver mais à esquerda, o portal aparece à direita; se ela estiver mais à direita, o portal aparece à esquerda. Animar por código:

- escala pulsando;
- leve oscilação/rotação;
- brilho;
- partículas simples.

Popup:

```text
Pressione Quadrado / E para atravessar o portal.
```

### Saída

Ao interagir com o portal:

1. bloquear controle e iniciar uma curta cutscene;
2. Danubia virar para o portal e ser puxada suavemente até o centro;
3. usar duas metades do portal para dar sensação de profundidade, com uma metade atrás e outra na frente da personagem;
4. aplicar fade de alpha na Danubia perto do final, até desaparecer;
5. disparar uma transição temporal fullscreen com overlays mágicos, anéis e pulso de câmera;
6. iniciar `MontmartreScene`.

---

# 12. MontmartreScene — Primeiros resgates

## 12.1 Background

```text
public/assets/backgrounds/bg-paris-montmartre.png
```

## 12.2 Personagens e sprites

| Personagem | Asset |
|---|---|
| Danubia | gameplay |
| Pudim | `pudim.png` |
| Zoe | `zoe.png` |
| Drogo | `drogo.png` |
| Monsieur Minuit | retrato ou sprite opcional |

## 12.3 Efeitos usados

| Efeito | Asset |
|---|---|
| Bolha temporal | `effect-time-bubble.png` |
| Barreira temporal | `effect-time-barrier.png` |

## 12.4 Objetivo

Resgatar, em ordem visual, os três primeiros animais:

1. Pudim
2. Zoe
3. Drogo

A ordem pode ser flexível se o jogador explorar, mas o level design deve naturalmente conduzir nessa sequência.

## 12.5 Entrada da cena

Danubia sai de um portal no lado esquerdo da cena. O portal deve continuar a linguagem visual da casa:

- duas metades verticais;
- uma metade atrás da personagem e a outra na frente;
- pulso e leve oscilação;
- saída lenta antes de liberar controle.

Ao chegar em Montmartre:

1. manter por alguns instantes a transição temporal vinda da casa;
2. criar o portal próximo ao lado esquerdo;
3. Danubia surgir parcialmente escondida e caminhar para a direita saindo do portal;
4. restaurar o alpha da personagem até 100%;
5. fazer o portal desaparecer com fade/scale;
6. só então devolver o controle ao jogador.

**Danubia normal:**

```text
Paris...
```

**Danubia irritada:**

```text
Eu sempre quis vir para cá, mas imaginava uma viagem com menos sequestros.
```

Mensagem do celular:

```text
Checklist atualizada.
Encontre os desaparecidos.
```

## 12.6 Mecânica dos resgates

Cada animal aparece dentro da bolha temporal. A bolha é o asset `effect-time-bubble.png`, redimensionado para envolver o animal.

Ao se aproximar:

```text
Pressione Quadrado / E para libertar.
```

Ao interagir:

1. bolha treme;
2. bolha desaparece com fade;
3. animal pula ou flutua levemente;
4. checklist marca o item;
5. animal some em partículas indo "para casa".

## 12.7 Pudim

### Posição

Perto de uma pequena plataforma baixa, ensinando pulo simples.

### Diálogo

**Danubia feliz:**

```text
Pudim!
```

**Danubia normal:**

```text
Um encontrado. Faltam... muitos.
```

Checklist:

```text
✓ Pudim encontrado
```

HUD:

```text
Gatos 0/6 | Cachorros 1/3 | Família 0/3
```

## 12.8 Zoe

### Posição

Sobre ou perto da área do café.

### Diálogo

**Danubia normal:**

```text
Zoe?
```

**Danubia irritada:**

```text
Você foi sequestrada e decidiu sentar em um café?
```

Mensagem sem retrato:

```text
Zoe: Miau.
```

**Danubia normal:**

```text
Paris mexeu com você.
```

Checklist:

```text
✓ Zoe encontrada
```

## 12.9 Drogo

### Posição

Próximo a uma barreira temporal.

### Como acontece

Drogo fica atrás da barreira `effect-time-barrier.png`. Danubia deve interagir com um ponto próximo para desligar a barreira. Pode ser apenas uma zona invisível com brilho no próprio cenário.

### Diálogo

**Danubia preocupada:**

```text
Drogo, espera! Eu vou tirar você daí.
```

Após libertar:

**Danubia feliz:**

```text
Muito bem. Agora volte para casa e não enfrente nenhum relojoeiro francês sem mim.
```

Checklist:

```text
✓ Drogo encontrado
```

## 12.10 Mensagem de Monsieur

Após os três resgates, o celular toca.

**Monsieur Minuit:**

```text
Eles deveriam ter permanecido perfeitamente imóveis.
```

**Danubia irritada:**

```text
Você tentou manter nove animais imóveis?
```

**Monsieur Minuit:**

```text
Foi um erro de planejamento.
```

## 12.11 Saída

Ao chegar ao lado direito da fase:

- salvar checkpoint `paris-seine`;
- fade;
- iniciar `SeineScene`.

---

# 13. SeineScene — Margens do Sena

## 13.1 Background

```text
public/assets/backgrounds/bg-paris-seine.png
```

## 13.2 Personagens e sprites

| Personagem | Asset |
|---|---|
| Danubia | gameplay |
| Pirata | `pirata.png` |
| Batata | `batata.png` |
| Pituca | `pituca.png` |

## 13.3 Efeitos usados

| Efeito | Asset |
|---|---|
| Bolha temporal | `effect-time-bubble.png` |

## 13.4 Objetivo

Resgatar:

1. Pirata
2. Batata
3. Pituca

## 13.5 Mecânicas

- Plataformas simples sobre elementos do cenário.
- Cair na água não causa Game Over; Danubia reaparece no último ponto seguro.
- Usar pequenas colisões invisíveis em barcos, caixas e calçada.

## 13.6 Entrada da cena

**Danubia normal:**

```text
Margem do Sena.
```

**Danubia preocupada:**

```text
Espero que ninguém espere que eu atravesse isso nadando.
```

## 13.7 Pirata

### Posição

Dentro ou próximo ao barco.

### Diálogo

**Danubia normal:**

```text
Pirata em um barco.
```

**Danubia irritada:**

```text
Claro.
```

Após resgate:

```text
✓ Pirata encontrado
```

Mensagem:

```text
Todos os cachorros foram encontrados.
```

HUD:

```text
Gatos 1/6 | Cachorros 3/3 | Família 0/3
```

## 13.8 Batata

### Posição

Perto da barraca de comida.

### Diálogo

**Danubia normal:**

```text
Batata...
```

**Danubia irritada:**

```text
Você não tentou escapar. Você veio comer.
```

Mensagem sem retrato:

```text
Batata: Miau.
```

**Danubia normal:**

```text
Resolvemos isso depois.
```

Checklist:

```text
✓ Batata encontrada
```

## 13.9 Pituca

### Posição

Entre caixas ou malas.

### Diálogo

**Danubia feliz:**

```text
Pituca! Encontrei você.
```

**Danubia normal:**

```text
Tá tudo bem. A mamãe chegou.
```

Checklist:

```text
✓ Pituca encontrada
```

HUD final da cena:

```text
Gatos 3/6 | Cachorros 3/3 | Família 0/3
```

## 13.10 Mensagem misteriosa

Após os três resgates, o celular recebe uma mensagem.

Mensagem do celular:

```text
Você está procurando apenas quem desapareceu...
ou também o momento que perdeu?
```

**Danubia irritada:**

```text
Eu nem sei o que isso significa.
```

Essa mensagem é a primeira pista clara de que Monsieur Minuit não é apenas "malvado"; ele está tentando congelar momentos.

## 13.11 Saída

Ao chegar à direita:

- salvar checkpoint `paris-garden`;
- fade;
- iniciar `GardenScene`.

---

# 14. GardenScene — Brecko, Lelo e Pure

## 14.1 Background

```text
public/assets/backgrounds/bg-paris-garden.png
```

## 14.2 Personagens e sprites

| Personagem | Asset |
|---|---|
| Danubia | gameplay |
| Brecko, Lelo e Pure | `brecko-lelo-pure.png` |
| Monsieur Minuit | retrato opcional |

## 14.3 Efeitos usados

| Efeito | Asset |
|---|---|
| Bolha temporal | `effect-time-bubble.png` |
| Interruptor temporal | `effect-time-switch.png` |
| Portal, opcional | `effect-time-portal.png` |

## 14.4 Objetivo

Libertar os três irmãos juntos.

Como só existe um sprite agrupado, o resgate será coletivo, mas a checklist marcará:

```text
✓ Brecko encontrado
✓ Lelo encontrado
✓ Pure encontrado
```

## 14.5 Entrada da cena

**Danubia normal:**

```text
Esse lugar tem cara de quem guarda segredos.
```

**Danubia preocupada:**

```text
E provavelmente gatos.
```

## 14.6 Prisão temporal coletiva

Brecko, Lelo e Pure aparecem juntos dentro de uma grande bolha temporal. Usar `effect-time-bubble.png` em escala maior.

A prisão possui três interruptores `effect-time-switch.png`.

### Mecânica

Danubia deve ativar três interruptores. Cada interruptor:

1. toca um som curto;
2. muda de cor por tint;
3. faz a bolha tremer;
4. reduz a opacidade da bolha.

Após o terceiro interruptor, a bolha desaparece.

### Diálogo ao encontrar

**Danubia feliz:**

```text
Brecko, Lelo e Pure...
```

**Danubia normal:**

```text
Os três juntos. É claro.
```

### Ao ativar o primeiro interruptor

```text
A prisão temporal ficou mais fraca.
```

### Ao ativar o segundo

```text
Quase lá.
```

### Ao ativar o terceiro

```text
O tempo voltou a correr.
```

Os três gatos "escapam" com um tween rápido: pequeno salto e fade.

**Danubia irritada:**

```text
Um de cada vez!
```

Mensagem sem retrato:

```text
Os três ignoraram completamente.
```

**Danubia normal:**

```text
Eu deveria ter imaginado.
```

## 14.7 Checklist

Mostrar automaticamente:

```text
✓ Brecko encontrado
✓ Lelo encontrado
✓ Pure encontrado

Todos os animais foram encontrados!
```

HUD:

```text
Gatos 6/6 | Cachorros 3/3 | Família 0/3
```

## 14.8 Caminho para a oficina

Após todos os animais, a porta ou entrada da oficina fica disponível.

Mensagem do celular:

```text
Sinal temporal localizado.
Destino: Oficina de Monsieur Minuit.
```

**Danubia normal:**

```text
Então é lá que todo mundo está.
```

### Saída

Ao interagir com a entrada da oficina:

- salvar checkpoint `workshop`;
- fade;
- iniciar `WorkshopScene`.

---

# 15. WorkshopScene — Confronto final

## 15.1 Background

```text
public/assets/backgrounds/bg-paris-workshop.png
```

## 15.2 Personagens e sprites

| Personagem | Asset |
|---|---|
| Danubia | gameplay completo |
| Monsieur Minuit | `monsieur-idle.png`, gesture, watch, defeated |
| Filho | `son.png` |
| Filha | `daughter.png` |
| Marido | `husband.png` |

## 15.3 Efeitos e obstáculos

| Elemento | Asset |
|---|---|
| Âncora temporal | `effect-time-anchor.png` |
| Pulso temporal | `effect-time-golden-pulse.png` |
| Bolha temporal | `effect-time-bubble.png` |
| Ponteiro | `hazard-clock-hand.png` |
| Despertador | `hazard-alarm-clock.png` |
| Calendário | `hazard-calendar.png` |
| Nuvem | `hazard-cloud.png` |
| Engrenagem | `hazard-gear.png` |
| Reunião | `hazard-meeting.png` |

## 15.4 Propósito narrativo

Revelar que Monsieur Minuit não sequestrou a família por maldade simples. Ele congelou o momento em que eles preparavam a surpresa de aniversário porque acredita que momentos felizes deveriam ser preservados antes de acabarem.

## 15.5 Estado visual da família

Filho, filha e marido ficam posicionados ao fundo, cada um preso por uma bolha temporal ou tint azul.

Não é necessário asset separado de "congelado". Implementar por código:

- tint azul claro;
- alpha levemente reduzido;
- bolha temporal por cima;
- partículas pequenas;
- animação de flutuação muito leve.

## 15.6 Entrada da cena

Danubia entra pela esquerda. Monsieur Minuit está no centro ou à direita.

**Danubia irritada:**

```text
Então era isso.
```

**Danubia preocupada:**

```text
Você congelou todo mundo.
```

**Monsieur Minuit normal:**

```text
Eu preservei este instante.
```

**Danubia irritada:**

```text
Sem pedir para ninguém.
```

**Monsieur Minuit triste/reflexivo:**

```text
Momentos perfeitos sempre acabam.
```

**Monsieur Minuit:**

```text
Pessoas mudam. Filhos crescem. Animais chegam, envelhecem, partem.
```

**Monsieur Minuit:**

```text
Eu apenas impeço que o tempo estrague aquilo que é bonito.
```

**Danubia normal:**

```text
Impedindo todo mundo de viver?
```

**Monsieur Minuit irritado:**

```text
Mantendo tudo exatamente como deveria ser.
```

**Danubia normal:**

```text
Exatamente como deveria ser não existe.
```

Monsieur ativa o relógio.

## 15.7 Poder temporal

Danubia desbloqueia o poder temporal automaticamente no início da batalha.

Mensagem:

```text
Novo poder desbloqueado: Pulso de Afeto
Pressione Círculo / F para usar.
```

O nome é propositalmente carinhoso e meio bobo. Funciona melhor do que fingir que é um ataque agressivo.

## 15.8 Mecânica da batalha

A batalha não é física. O objetivo é desativar três âncoras temporais.

### Regras

- Existem três âncoras `effect-time-anchor.png`.
- Uma âncora fica vulnerável por vez.
- Para desativar uma âncora, Danubia deve se aproximar e usar o poder temporal.
- O poder usa a animação `danubia-power-01` e `danubia-power-02` e exibe `effect-time-golden-pulse.png`.
- Cada âncora destruída liberta um familiar.
- Entre as âncoras, obstáculos aparecem por tempo curto.

### Vida

Danubia tem 3 corações.

Ao levar dano:

1. trocar para `danubia-damage.png`;
2. piscar;
3. perder um coração;
4. ficar invencível por 1 segundo.

Ao chegar a 0:

- reiniciar `WorkshopScene` no checkpoint;
- não repetir toda a cutscene inicial, apenas uma fala curta.

Mensagem no retry:

```text
De novo. Agora eu já sei como esse relógio funciona.
```

## 15.9 Padrão 1 — Filho

### Obstáculos

- `hazard-alarm-clock.png`
- `hazard-calendar.png`

Movimentos simples:

- despertador pula horizontalmente;
- calendário atravessa a tela lentamente.

### Objetivo

Desativar a primeira âncora.

### Ao desativar

Checklist:

```text
✓ Filho encontrado
```

Remover bolha/tint do filho.

Diálogo rápido:

**Filho:**

```text
Mãe!
```

**Danubia feliz:**

```text
Eu te achei.
```

## 15.10 Padrão 2 — Filha

### Obstáculos

- `hazard-gear.png`
- `hazard-meeting.png`

Movimentos simples:

- engrenagem rola pelo chão;
- janela de reunião desce de cima e sobe novamente.

### Ao desativar

Checklist:

```text
✓ Filha encontrada
```

Remover bolha/tint da filha.

Diálogo rápido:

**Filha:**

```text
Você conseguiu!
```

**Danubia normal:**

```text
Ainda falta acabar com esse relógio.
```

## 15.11 Padrão 3 — Marido

### Obstáculos

- `hazard-clock-hand.png`
- `hazard-cloud.png`
- `hazard-gear.png`, opcional

Movimentos simples:

- ponteiro gira ou varre uma área;
- nuvem se move no alto;
- nuvem pode soltar um raio simples feito por código.

### Ao desativar

Checklist:

```text
✓ Marido encontrado
```

Remover bolha/tint do marido.

Diálogo rápido:

**Marido:**

```text
Você chegou.
```

**Danubia irritada:**

```text
Claro que cheguei. Vocês sumiram no meu aniversário.
```

## 15.12 Encerramento da batalha

Após a terceira âncora:

- parar obstáculos;
- tremer a tela;
- reduzir brilho do relógio;
- Monsieur troca para `monsieur-defeated.png`.

Checklist final de resgate:

```text
Gatos 6/6 | Cachorros 3/3 | Família 3/3
```

## 15.13 Diálogo com Monsieur Minuit

**Monsieur Minuit triste/reflexivo:**

```text
Agora o momento terminará.
```

**Danubia normal:**

```text
Sim.
```

**Monsieur Minuit:**

```text
E isso não assusta você?
```

**Danubia triste/preocupada:**

```text
Um pouco.
```

**Danubia normal:**

```text
Mas depois desse momento vem outro. E depois outro.
```

**Danubia feliz:**

```text
Minha família não precisa ficar parada para continuar sendo minha família.
```

**Monsieur Minuit triste/reflexivo:**

```text
Passei tanto tempo tentando guardar momentos...
```

**Monsieur Minuit:**

```text
...que esqueci de vivê-los.
```

**Danubia normal:**

```text
Ainda dá tempo.
```

Monsieur não explode. Ele apenas aceita a derrota e muda de postura.

### Saída

Salvar checkpoint `ending` e iniciar `EndingScene`, ou continuar na mesma cena com estado final. Para implementação simples, pode iniciar `EndingScene`.

---

# 16. EndingScene — Presente final

## 16.1 Background

Reutilizar:

```text
public/assets/backgrounds/bg-paris-workshop.png
```

Aplicar iluminação mais quente por overlay dourado transparente.

## 16.2 Personagens

| Personagem | Asset |
|---|---|
| Danubia | `danubia-victory.png` ou `danubia-idle.png` |
| Filho | `son.png` |
| Filha | `daughter.png` |
| Marido | `husband.png` |
| Monsieur Minuit | `monsieur-defeated.png` ou `monsieur-idle.png` |
| Animais | `pudim.png`, `zoe.png`, `drogo.png`, `pirata.png`, `batata.png`, `pituca.png`, `brecko-lelo-pure.png` |

## 16.3 Como acontece

Todos aparecem reunidos na oficina. Os animais podem entrar por pequenos fades ou surgir em posições ao redor da família.

Não é preciso animar todos. Usar:

- pequenos saltos nos animais;
- flutuação leve;
- fade-in;
- reposicionamento em composição final.

## 16.4 Diálogo final

**Filho:**

```text
Então... feliz aniversário!
```

**Filha:**

```text
Desculpa pelo sequestro.
```

**Marido:**

```text
Essa parte não estava no planejamento.
```

**Danubia irritada:**

```text
Espero mesmo que não.
```

**Marido:**

```text
A gente queria preparar uma surpresa.
```

**Filho:**

```text
Uma coisa para acompanhar você nos próximos momentos.
```

**Filha:**

```text
Nos engraçados, nos importantes...
```

**Filho:**

```text
...e até nos completamente caóticos.
```

**Monsieur Minuit:**

```text
Então não tentem fazer este momento durar para sempre.
```

**Monsieur Minuit:**

```text
Apenas façam valer a pena.
```

## 16.5 Checklist final

Abrir o celular expandido.

Mostrar:

```text
Checklist concluída

✓ 6 gatos
✓ 3 cachorros
✓ 1 filho
✓ 1 filha
✓ 1 marido
[ ] 1 presente
```

O último item pisca.

Após alguns segundos:

```text
O último item não está dentro do jogo.
```

Depois:

```text
MISSÃO FINAL:
Olhe para sua família.
```

Nesse momento, o jogo deve parar esperando input. A família entrega o celular físico.

## 16.6 Depois da entrega

Quando alguém apertar `Quadrado` / `E`:

```text
✓ Presente encontrado!
```

Depois:

```text
Novos momentos desbloqueados.
```

Tela final:

```text
Feliz aniversário, Danubia.
Nós amamos você.
```

### Créditos simples

Opcional:

```text
Criado com amor pela sua família.
```

## 16.7 Finalização

Opções:

```text
Pressione X / Espaço para jogar novamente.
Pressione Esc para sair da tela cheia.
```

---

# 17. Progressão resumida

```text
Menu
  ↓
Sala
  ↓
Corredor
  ├─ Quarto do filho → Fragmento 1
  ├─ Quarto da filha → Fragmento 2
  └─ Escritório → Fragmento 3 → Ligação → Portal
       ↓
Montmartre → Pudim, Zoe, Drogo
       ↓
Sena → Pirata, Batata, Pituca
       ↓
Jardim → Brecko, Lelo e Pure
       ↓
Oficina → Filho, Filha, Marido
       ↓
Final → Presente físico
```

---

# 18. Ordem de implementação recomendada

## Milestone 1 — Base jogável

- BootScene.
- MenuScene.
- HomeScene com sala e corredor.
- Danubia andando, pulando e interagindo.
- Troca de background por porta.

## Milestone 2 — Casa completa

- Quarto do filho.
- Quarto da filha.
- Escritório.
- Fragmentos.
- Relógio completo.
- Ligação de Monsieur.
- Portal.

## Milestone 3 — Checklist e resgates

- HUD.
- Celular expandido.
- Resgate de pets.
- Montmartre, Sena e Jardim.

## Milestone 4 — Oficina

- Família congelada.
- Monsieur.
- Poder temporal.
- Âncoras.
- Obstáculos.
- Vitória.

## Milestone 5 — Final

- Cena final.
- Checklist do presente.
- Mensagem para entrega física.
- Build final e teste na TV.

---

# 19. Prioridades em caso de falta de tempo

Se o prazo apertar, cortar nesta ordem:

1. Plataformas opcionais.
2. Obstáculos fora da batalha final.
3. Animações extras de Monsieur.
4. Interações opcionais da casa.
5. Popups decorativos.
6. Partículas.
7. Créditos.

Nunca cortar:

- Danubia jogável.
- Casa com fragmentos.
- Portal.
- Resgate dos animais.
- Motivação de Monsieur Minuit.
- Resgate da família.
- Cena final do presente.
