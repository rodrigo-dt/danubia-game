# Asset manifest

Este arquivo lista os assets existentes no projeto e o status esperado para uso no jogo.

## Raiz considerada

Os caminhos abaixo consideram a raiz de assets como:

```text
public/assets/
```

Se o projeto estiver usando apenas `assets/`, mantenha os mesmos caminhos relativos e ajuste apenas o prefixo no carregamento do Phaser.

## Status

| Status | Significado |
|---|---|
| READY | Arquivo pronto para ser carregado pelo jogo |
| SOURCE | Arquivo-fonte/editável; não deve ser carregado em runtime |
| IGNORE | Arquivo de sistema ou lixo local; não deve ir para o jogo |
| ATTENTION | Arquivo existe, mas exige atenção no código ou no planejamento |
| MISSING | Asset esperado pelo design, mas ainda não existe |

## Observações importantes

- Arquivos `.DS_Store` devem ser removidos do repositório e ignorados no `.gitignore`.
- Arquivos `.psd` devem ficar fora de `public/assets` se possível, pois são arquivos-fonte.
- O código deve carregar os arquivos usando os nomes reais abaixo, não os nomes planejados anteriormente.
- Os assets de Brecko, Lelo e Pure existem como uma única imagem agrupada: `brecko-lelo-pure.png`.
- Danubia possui apenas um arquivo de idle: `danubia-idle.png`.
- Monsieur Minuit usa `monsieur-idle.png` como pose base e também possui poses extras `gesture` e `watch`.
- A sprite de dano de Danubia se chama `danubia-damage.png`, não `danubia-hurt.png`.

---

# Runtime assets

## Backgrounds

| Asset | Path | Size | Status |
|---|---|---:|---|
| Cover / title screen | `public/assets/backgrounds/cover.png` | 960×540 | READY |
| Home daughter bedroom | `public/assets/backgrounds/bg-home-daughter-bedroom.png` | 960×540 | READY |
| Home hall | `public/assets/backgrounds/bg-home-hall.png` | 960×540 | READY |
| Home living room | `public/assets/backgrounds/bg-home-living-room.png` | 960×540 | READY |
| Home office | `public/assets/backgrounds/bg-home-office.png` | 960×540 | READY |
| Home son bedroom | `public/assets/backgrounds/bg-home-son-bedroom.png` | 960×540 | READY |
| Paris garden | `public/assets/backgrounds/bg-paris-garden.png` | 960×540 | READY |
| Paris Montmartre | `public/assets/backgrounds/bg-paris-montmartre.png` | 960×540 | READY |
| Paris Seine | `public/assets/backgrounds/bg-paris-seine.png` | 960×540 | READY |
| Paris workshop | `public/assets/backgrounds/bg-paris-workshop.png` | 960×540 | READY |

## Danubia

| Asset | Path | Size | Status |
|---|---|---:|---|
| Danubia idle | `public/assets/characters/danubia/danubia-idle.png` | 128×128 | ATTENTION |
| Danubia walk 01 | `public/assets/characters/danubia/walk/danubia-walk-01.png` | 128×128 | READY |
| Danubia walk 02 | `public/assets/characters/danubia/walk/danubia-walk-02.png` | 128×128 | READY |
| Danubia walk 03 | `public/assets/characters/danubia/walk/danubia-walk-03.png` | 128×128 | READY |
| Danubia walk 04 | `public/assets/characters/danubia/walk/danubia-walk-04.png` | 128×128 | READY |
| Danubia jump | `public/assets/characters/danubia/danubia-jump.png` | 128×128 | READY |
| Danubia damage | `public/assets/characters/danubia/danubia-damage.png` | 128×128 | READY |
| Danubia power 01 | `public/assets/characters/danubia/power/danubia-power-01.png` | 128×128 | READY |
| Danubia power 02 | `public/assets/characters/danubia/power/danubia-power-02.png` | 128×128 | READY |
| Danubia victory | `public/assets/characters/danubia/danubia-victory.png` | 128×128 | READY |

### Danubia portraits

| Asset | Path | Size | Status |
|---|---|---:|---|
| Danubia portrait normal | `public/assets/characters/danubia/portrait/danubia-portrait-normal.png` | 128×128 | READY |
| Danubia portrait angry | `public/assets/characters/danubia/portrait/danubia-portrait-angry.png` | 128×128 | READY |
| Danubia portrait sad | `public/assets/characters/danubia/portrait/danubia-portrait-sad.png` | 128×128 | READY |
| Danubia portrait happy | `public/assets/characters/danubia/portrait/danubia-portrait-happy.png` | 128×128 | READY |

## Monsieur Minuit

| Asset | Path | Size | Status |
|---|---|---:|---|
| Monsieur idle | `public/assets/characters/monsieur-minuit/monsieur-idle.png` | 128×128 | ATTENTION |
| Monsieur gesture 01 | `public/assets/characters/monsieur-minuit/gesture/monsieur-gesture-01.png` | 128×128 | READY |
| Monsieur gesture 02 | `public/assets/characters/monsieur-minuit/gesture/monsieur-gesture-02.png` | 128×128 | READY |
| Monsieur watch 01 | `public/assets/characters/monsieur-minuit/watch/monsieur-watch-01.png` | 128×128 | READY |
| Monsieur watch 02 | `public/assets/characters/monsieur-minuit/watch/monsieur-watch-02.png` | 128×128 | READY |
| Monsieur defeated | `public/assets/characters/monsieur-minuit/monsieur-defeated.png` | 128×128 | READY |

### Monsieur Minuit portraits

| Asset | Path | Size | Status |
|---|---|---:|---|
| Monsieur portrait normal | `public/assets/characters/monsieur-minuit/portraits/monsieur-portrait-normal.png` | 128×128 | READY |
| Monsieur portrait angry | `public/assets/characters/monsieur-minuit/portraits/monsieur-portrait-angry.png` | 128×128 | READY |
| Monsieur portrait sad 01 | `public/assets/characters/monsieur-minuit/portraits/monsieur-portrait-sad-01.png` | 128×128 | READY |
| Monsieur portrait sad 02 | `public/assets/characters/monsieur-minuit/portraits/monsieur-portrait-sad-02.png` | 128×128 | READY |

## Family

| Asset | Path | Size | Status |
|---|---|---:|---|
| Daughter sprite | `public/assets/characters/family/daughter.png` | 128×128 | READY |
| Daughter portrait | `public/assets/characters/family/daughter-portrait.png` | 128×128 | READY |
| Husband sprite | `public/assets/characters/family/husband.png` | 128×128 | READY |
| Husband portrait | `public/assets/characters/family/husband-portrait.png` | 128×128 | READY |
| Son sprite | `public/assets/characters/family/son.png` | 128×128 | READY |
| Son portrait | `public/assets/characters/family/son-portrait.png` | 128×128 | READY |

## Pets

| Asset | Path | Size | Status |
|---|---|---:|---|
| Pudim | `public/assets/characters/pets/pudim.png` | 128×128 | READY |
| Zoe | `public/assets/characters/pets/zoe.png` | 128×128 | READY |
| Drogo | `public/assets/characters/pets/drogo.png` | 128×128 | READY |
| Pirata | `public/assets/characters/pets/pirata.png` | 128×128 | READY |
| Batata | `public/assets/characters/pets/batata.png` | 128×128 | READY |
| Pituca | `public/assets/characters/pets/pituca.png` | 128×128 | READY |
| Brecko, Lelo and Pure group | `public/assets/characters/pets/brecko-lelo-pure.png` | 128×128 | ATTENTION |

## Effects

| Asset | Path | Size | Status |
|---|---|---:|---|
| Clock fragment 01 | `public/assets/effects/clock-fragment-01.png` | 128×128 | READY |
| Clock fragment 02 | `public/assets/effects/clock-fragment-02.png` | 128×128 | READY |
| Clock fragment 03 | `public/assets/effects/clock-fragment-03.png` | 128×128 | READY |
| Complete clock effect | `public/assets/effects/effect-clock-complete.png` | 128×128 | READY |
| Time anchor effect | `public/assets/effects/effect-time-anchor.png` | 128×128 | READY |
| Time barrier effect | `public/assets/effects/effect-time-barrier.png` | 128×256 | READY |
| Time bubble effect | `public/assets/effects/effect-time-bubble.png` | 380×380 | READY |
| Golden time pulse effect | `public/assets/effects/effect-time-golden-pulse.png` | 128×128 | READY |
| Time portal effect | `public/assets/effects/effect-time-portal.png` | 380×380 | READY |
| Time switch effect | `public/assets/effects/effect-time-switch.png` | 128×128 | READY |

## Hazards

| Asset | Path | Size | Status |
|---|---|---:|---|
| Alarm clock hazard | `public/assets/hazards/hazard-alarm-clock.png` | 128×128 | READY |
| Calendar hazard | `public/assets/hazards/hazard-calendar.png` | 128×128 | READY |
| Clock hand hazard | `public/assets/hazards/hazard-clock-hand.png` | 64×256 | READY |
| Cloud hazard | `public/assets/hazards/hazard-cloud.png` | 128×128 | READY |
| Gear hazard | `public/assets/hazards/hazard-gear.png` | 128×128 | READY |
| Meeting hazard | `public/assets/hazards/hazard-meeting.png` | 128×128 | READY |

## UI

| Asset | Path | Size | Status |
|---|---|---:|---|
| Dialogue frame | `public/assets/ui/ui-dialogue-frame.png` | 320×160 | READY |
| Cat icon | `public/assets/ui/ui-icon-cat.png` | 128×128 | READY |
| Dog icon | `public/assets/ui/ui-icon-dog.png` | 128×128 | READY |
| Family icon | `public/assets/ui/ui-icon-family.png` | 128×128 | READY |
| Gift icon | `public/assets/ui/ui-icon-gift.png` | 128×128 | READY |
| Heart icon | `public/assets/ui/ui-icon-heart.png` | 128×128 | READY |
| Phone compact | `public/assets/ui/ui-phone-compact.png` | 128×128 | READY |
| Phone expanded | `public/assets/ui/ui-phone-expanded.png` | 320×480 | READY |

---

# Source and ignored files

| File | Path | Size | Status | Action |
|---|---|---:|---|---|
| Backgrounds Photoshop source | `public/assets/backgrounds/backgounds.psd` | 960×540 | SOURCE | Move to `art-source/` when possible |
| Characters Photoshop source | `public/assets/characters/characters.psd` | 128×128 | SOURCE | Move to `art-source/` when possible |
| macOS metadata | `public/assets/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/characters/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/characters/danubia/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/characters/monsieur-minuit/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/characters/monsieur-minuit/portraits/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/effects/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/hazards/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |
| macOS metadata | `public/assets/ui/.DS_Store` | N/A | IGNORE | Delete and add to `.gitignore` |

---

# Implementation notes

## Asset key naming

Use asset keys in lowercase kebab-case. Suggested keys:

```ts
export const AssetKeys = {
  // Backgrounds
  bgCover: 'bg-cover',
  bgHomeLivingRoom: 'bg-home-living-room',
  bgHomeHall: 'bg-home-hall',
  bgHomeSonBedroom: 'bg-home-son-bedroom',
  bgHomeDaughterBedroom: 'bg-home-daughter-bedroom',
  bgHomeOffice: 'bg-home-office',
  bgParisMontmartre: 'bg-paris-montmartre',
  bgParisSeine: 'bg-paris-seine',
  bgParisGarden: 'bg-paris-garden',
  bgParisWorkshop: 'bg-paris-workshop',

  // Danubia
  danubiaIdle: 'danubia-idle',
  danubiaWalk01: 'danubia-walk-01',
  danubiaWalk02: 'danubia-walk-02',
  danubiaWalk03: 'danubia-walk-03',
  danubiaWalk04: 'danubia-walk-04',
  danubiaJump: 'danubia-jump',
  danubiaDamage: 'danubia-damage',
  danubiaPower01: 'danubia-power-01',
  danubiaPower02: 'danubia-power-02',
  danubiaVictory: 'danubia-victory',

  // Monsieur Minuit
  monsieurIdle: 'monsieur-idle',
  monsieurGesture01: 'monsieur-gesture-01',
  monsieurGesture02: 'monsieur-gesture-02',
  monsieurWatch01: 'monsieur-watch-01',
  monsieurWatch02: 'monsieur-watch-02',
  monsieurDefeated: 'monsieur-defeated',
} as const;
```

## Missing or changed from the original plan

| Original expected asset | Current situation | Recommendation |
|---|---|---|
| `danubia-idle-01.png` and `danubia-idle-02.png` | Only `danubia-idle.png` exists | Use the same idle frame or generate a second one later |
| `danubia-hurt.png` | Existing file is `danubia-damage.png` | Use `danubia-damage` in code |
| `minuit-idle-01.png` and `minuit-idle-02.png` | Existing file is `monsieur-idle.png` | Use one idle frame for now |
| `minuit-*` filenames | Existing files use `monsieur-*` | Use existing names; do not rename during rushed development |
| `brecko.png`, `lelo.png`, `pure.png` | Only `brecko-lelo-pure.png` exists | Use the grouped sprite in the garden scene |
| `hazard-meeting-window.png` | Existing file is `hazard-meeting.png` | Use `hazard-meeting` in code |
| `time-portal.png` | Existing file is `effect-time-portal.png` | Use existing filename |
| `time-bubble.png` | Existing file is `effect-time-bubble.png` | Use existing filename |
| `ui-heart.png` | Existing file is `ui-icon-heart.png` | Use existing filename |

## Recommended `.gitignore` entries

```gitignore
.DS_Store
**/.DS_Store
dist/
node_modules/
art-source/
*.psd
```
