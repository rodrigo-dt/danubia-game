# Roadmap de Desenvolvimento — Danubia em: O aniversario que todo mundo desapareceu

## Objetivo deste roadmap

Implementar o jogo completo em ordem lógica de desenvolvimento, começando pela base técnica mínima e avançando até o final jogável, com todas as cenas, sistemas, interações, diálogos, checkpoints, HUD, checklist, resgates, confronto final e entrega física do presente.

---

# 1. Preparação inicial do projeto

## 1.1 Conferência da estrutura de pastas

* [x] Confirmar que a estrutura principal existe:

    * [x] `docs`
    * [x] `public`
    * [x] `public/assets`
    * [x] `src`
    * [x] `src/characters`
    * [x] `src/data`
    * [x] `src/game`
    * [x] `src/scenes`
    * [x] `src/systems`
    * [x] `src/ui`

* [x] Confirmar que os arquivos principais existem:

    * [x] `index.html`
    * [x] `package.json`
    * [x] `package-lock.json`
    * [x] `tsconfig.json`
    * [x] `vite.config.ts`
    * [x] `src/main.ts`
    * [x] `src/style.css`
    * [x] `src/game/config.ts`
    * [x] `src/game/constants.ts`

* [x] Corrigir inconsistências de nome:

    * [x] Garantir que o CSS importado em `main.ts` tenha o mesmo nome do arquivo real.
    * [x] Renomear `GardensScene.ts` para `GardenScene.ts`, caso ainda esteja no plural.
    * [x] Garantir que cada arquivo de cena tenha uma classe exportada com o mesmo nome do arquivo.

---

## 1.2 Registro das cenas no Phaser

* [x] Abrir `src/game/config.ts`.

* [x] Importar todas as cenas:

    * [x] `BootScene`
    * [x] `MenuScene`
    * [x] `HomeScene`
    * [x] `MontmartreScene`
    * [x] `SeineScene`
    * [x] `GardenScene`
    * [x] `WorkshopScene`
    * [x] `EndingScene`

* [x] Registrar as cenas no array `scene` na ordem correta:

    * [x] `BootScene`
    * [x] `MenuScene`
    * [x] `HomeScene`
    * [x] `MontmartreScene`
    * [x] `SeineScene`
    * [x] `GardenScene`
    * [x] `WorkshopScene`
    * [x] `EndingScene`

* [x] Garantir que cada cena chame `super(SCENE_KEYS.nomeDaCena)` no construtor.

* [x] Rodar o projeto e confirmar que o Phaser inicia sem erro de cena ausente.

---

# 2. Base técnica global

## 2.1 Constantes globais

* [x] Revisar `src/game/constants.ts`.

* [x] Confirmar valores:

    * [x] largura interna: `960`
    * [x] altura interna: `540`
    * [x] velocidade da Danubia
    * [x] força do pulo
    * [x] caminho base dos assets
    * [x] chaves das cenas

* [ ] Adicionar constantes de gameplay:

    * [ ] quantidade máxima de vidas
    * [ ] duração de invencibilidade após dano
    * [ ] duração padrão de fade
    * [ ] duração padrão de popup
    * [ ] gravidade padrão
    * [ ] posição padrão do chão
    * [ ] velocidade padrão de obstáculos

---

## 2.2 Tipos do jogo

* [ ] Criar ou revisar `src/game/types.ts`.

* [ ] Definir tipo para checkpoint:

    * [ ] `home`
    * [ ] `paris-montmartre`
    * [ ] `paris-seine`
    * [ ] `paris-garden`
    * [ ] `workshop`
    * [ ] `ending`

* [ ] Definir tipo para os pets:

    * [ ] `pudim`
    * [ ] `zoe`
    * [ ] `drogo`
    * [ ] `pirata`
    * [ ] `batata`
    * [ ] `pituca`
    * [ ] `brecko`
    * [ ] `lelo`
    * [ ] `pure`

* [ ] Definir tipo para família:

    * [ ] `son`
    * [ ] `daughter`
    * [ ] `husband`

* [ ] Definir tipo para `GameProgress`.

* [ ] Definir tipo para fala de diálogo:

    * [ ] personagem
    * [ ] retrato opcional
    * [ ] texto
    * [ ] expressão opcional
    * [ ] ação pós-fala opcional

* [ ] Definir tipo para interação:

    * [ ] id
    * [ ] zona
    * [ ] texto do prompt
    * [ ] callback de interação
    * [ ] condição para estar ativa

* [ ] Definir tipo para porta/cômodo:

    * [ ] origem
    * [ ] destino
    * [ ] posição de entrada
    * [ ] texto de interação

---

## 2.3 Estado inicial do jogo

* [ ] Criar ou revisar `src/game/states.ts`.

* [ ] Definir estado inicial:

    * [ ] checkpoint inicial como `home`
    * [ ] `collectedFragments` como `0`
    * [ ] todos os pets como `false`
    * [ ] todos os familiares como `false`
    * [ ] `hasTemporalPower` como `false`
    * [ ] vidas como `3`

* [ ] Criar função para clonar o estado inicial.

* [ ] Evitar mutação direta do objeto base.

* [ ] Garantir que o estado seja serializável em `localStorage`.

---

## 2.4 Chaves de assets

* [ ] Criar `src/game/assetKeys.ts`.

* [ ] Criar chaves para backgrounds:

    * [ ] capa/menu
    * [ ] sala
    * [ ] corredor
    * [ ] quarto do filho
    * [ ] quarto da filha
    * [ ] escritório
    * [ ] Montmartre
    * [ ] Sena
    * [ ] jardim
    * [ ] oficina

* [ ] Criar chaves para Danubia:

    * [ ] idle
    * [ ] jump
    * [ ] damage
    * [ ] victory
    * [ ] walk 01
    * [ ] walk 02
    * [ ] walk 03
    * [ ] walk 04
    * [ ] power 01
    * [ ] power 02
    * [ ] retrato normal
    * [ ] retrato feliz
    * [ ] retrato irritada
    * [ ] retrato triste/preocupada

* [ ] Criar chaves para Monsieur Minuit:

    * [ ] idle
    * [ ] defeated
    * [ ] gesture 01
    * [ ] gesture 02
    * [ ] watch 01
    * [ ] watch 02
    * [ ] retrato normal
    * [ ] retrato irritado/confiante
    * [ ] retrato triste/reflexivo

* [ ] Criar chaves para família:

    * [ ] filho sprite
    * [ ] filha sprite
    * [ ] marido sprite
    * [ ] filho retrato
    * [ ] filha retrato
    * [ ] marido retrato

* [ ] Criar chaves para pets:

    * [ ] Pudim
    * [ ] Zoe
    * [ ] Drogo
    * [ ] Pirata
    * [ ] Batata
    * [ ] Pituca
    * [ ] Brecko/Lelo/Pure agrupados

* [ ] Criar chaves para efeitos:

    * [ ] fragmento 1
    * [ ] fragmento 2
    * [ ] fragmento 3
    * [ ] relógio completo
    * [ ] portal
    * [ ] bolha temporal
    * [ ] barreira temporal
    * [ ] interruptor temporal
    * [ ] âncora temporal
    * [ ] pulso dourado

* [ ] Criar chaves para obstáculos:

    * [ ] despertador
    * [ ] calendário
    * [ ] ponteiro
    * [ ] nuvem
    * [ ] engrenagem
    * [ ] reunião

* [ ] Criar chaves para UI:

    * [ ] celular compacto
    * [ ] celular expandido
    * [ ] ícone de gato
    * [ ] ícone de cachorro
    * [ ] ícone de família
    * [ ] coração
    * [ ] moldura de diálogo

---

## 2.5 Camadas visuais

* [ ] Criar `src/game/depths.ts`.

* [ ] Definir profundidades:

    * [ ] background
    * [ ] cenário/interações atrás
    * [ ] fragmentos
    * [ ] pets/família
    * [ ] Danubia
    * [ ] efeitos atrás
    * [ ] efeitos à frente
    * [ ] obstáculos
    * [ ] HUD
    * [ ] checklist
    * [ ] diálogo
    * [ ] transição/fade

* [ ] Usar essas profundidades em todos os sprites principais.

* [ ] Evitar números mágicos de profundidade espalhados pelas cenas.

---

# 3. BootScene

## 3.1 Estrutura da cena

* [x] Garantir que `BootScene` seja exportada corretamente.
* [x] Garantir que a cena use a chave correta.
* [x] Criar método de preload.
* [x] Criar método de create.
* [x] Desativar suavização de pixel art quando necessário.

---

## 3.2 Carregamento de backgrounds

* [x] Carregar background da capa.
* [x] Carregar background da sala.
* [ ] Carregar background do corredor.
* [ ] Carregar background do quarto do filho.
* [ ] Carregar background do quarto da filha.
* [ ] Carregar background do escritório.
* [ ] Carregar background de Montmartre.
* [ ] Carregar background do Sena.
* [ ] Carregar background do jardim.
* [ ] Carregar background da oficina.

---

## 3.3 Carregamento de Danubia

* [x] Carregar sprite idle.
* [x] Carregar sprite jump.
* [ ] Carregar sprite damage.
* [ ] Carregar sprite victory.
* [x] Carregar frames de caminhada.
* [ ] Carregar frames do poder temporal.
* [ ] Carregar retratos de diálogo disponíveis.

---

## 3.4 Carregamento de Monsieur Minuit

* [ ] Carregar sprite idle.
* [ ] Carregar sprite defeated.
* [ ] Carregar frames de gesture.
* [ ] Carregar frames de watch.
* [ ] Carregar retratos disponíveis.

---

## 3.5 Carregamento da família

* [ ] Carregar sprite do filho.
* [ ] Carregar sprite da filha.
* [ ] Carregar sprite do marido.
* [ ] Carregar retrato do filho.
* [ ] Carregar retrato da filha.
* [ ] Carregar retrato do marido.

---

## 3.6 Carregamento dos pets

* [ ] Carregar Pudim.
* [ ] Carregar Zoe.
* [ ] Carregar Drogo.
* [ ] Carregar Pirata.
* [ ] Carregar Batata.
* [ ] Carregar Pituca.
* [ ] Carregar Brecko/Lelo/Pure agrupados.

---

## 3.7 Carregamento dos efeitos

* [ ] Carregar fragmento 1.
* [ ] Carregar fragmento 2.
* [ ] Carregar fragmento 3.
* [ ] Carregar relógio completo.
* [ ] Carregar portal.
* [ ] Carregar bolha temporal.
* [ ] Carregar barreira temporal.
* [ ] Carregar interruptor temporal.
* [ ] Carregar âncora temporal.
* [ ] Carregar pulso dourado.

---

## 3.8 Carregamento de obstáculos

* [ ] Carregar despertador.
* [ ] Carregar calendário.
* [ ] Carregar ponteiro.
* [ ] Carregar nuvem.
* [ ] Carregar engrenagem.
* [ ] Carregar reunião virtual.

---

## 3.9 Carregamento da UI

* [ ] Carregar celular compacto.
* [ ] Carregar celular expandido.
* [ ] Carregar ícone de gato.
* [ ] Carregar ícone de cachorro.
* [ ] Carregar ícone de família.
* [ ] Carregar coração.
* [ ] Carregar moldura de diálogo.

---

## 3.10 Animações globais

* [x] Criar animação `danubia-walk`.
* [ ] Criar animação `danubia-power`.
* [ ] Criar animação `monsieur-gesture`.
* [ ] Criar animação `monsieur-watch`.
* [x] Garantir que as animações não sejam recriadas se já existirem.
* [x] Após o preload, iniciar `MenuScene`.

---

# 4. Sistemas globais

## 4.1 SaveManager

* [ ] Criar ou revisar `src/systems/saveManager.ts`.
* [ ] Definir chave de `localStorage`.
* [ ] Implementar leitura do progresso salvo.
* [ ] Implementar gravação do progresso.
* [ ] Implementar reset do progresso.
* [ ] Implementar fallback para estado inicial se o save estiver corrompido.
* [ ] Garantir que nenhum erro de `localStorage` quebre o jogo.

---

## 4.2 CheckpointManager

* [ ] Criar ou revisar `src/systems/checkpointManager.ts`.
* [ ] Implementar função para salvar checkpoint.
* [ ] Implementar função para retornar checkpoint atual.
* [ ] Implementar função para restaurar estado a partir do checkpoint.
* [ ] Definir qual cena corresponde a cada checkpoint.
* [ ] Garantir que falha na batalha final retorne para `workshop`.
* [ ] Garantir que falha antes da oficina retorne para o checkpoint correto.

---

## 4.3 InputController

* [ ] Criar ou revisar `src/systems/inputController.ts`.

* [ ] Mapear teclado:

    * [ ] setas
    * [ ] A/D
    * [ ] espaço
    * [ ] E
    * [ ] F
    * [ ] Tab
    * [ ] Esc

* [ ] Mapear controle PlayStation:

    * [ ] analógico esquerdo
    * [ ] direcional
    * [ ] X para pular/confirmar
    * [ ] Quadrado para interagir/avançar diálogo
    * [ ] Círculo para poder temporal
    * [ ] Touchpad/Select para celular/checklist
    * [ ] Options para pausa

* [ ] Criar ações sem depender diretamente da tecla:

    * [ ] mover para esquerda
    * [ ] mover para direita
    * [ ] pular
    * [ ] interagir
    * [ ] usar poder temporal
    * [ ] abrir checklist
    * [ ] pausar

* [ ] Implementar detecção de botão recém-pressionado.

* [ ] Evitar múltiplas interações no mesmo frame.

* [ ] Permitir bloquear input durante diálogo.

* [ ] Permitir bloquear movimento mantendo input de avançar diálogo.

---

## 4.4 DialogueController

* [ ] Criar ou revisar `src/systems/dialogueController.ts`.
* [ ] Receber lista de falas.
* [ ] Exibir primeira fala.
* [ ] Avançar para próxima fala com E/Quadrado.
* [ ] Encerrar diálogo ao final.
* [ ] Travar movimento da Danubia durante diálogo.
* [ ] Liberar movimento ao terminar.
* [ ] Aceitar falas com retrato.
* [ ] Aceitar falas sem retrato.
* [ ] Aceitar falas narrativas.
* [ ] Aceitar falas do celular.
* [ ] Executar callback ao terminar diálogo.
* [ ] Evitar iniciar dois diálogos ao mesmo tempo.

---

## 4.5 InteractionController

* [ ] Criar `src/systems/interactionController.ts`.
* [ ] Permitir registrar zonas invisíveis.
* [ ] Permitir associar texto de prompt a uma zona.
* [ ] Detectar quando Danubia entra na zona.
* [ ] Detectar quando Danubia sai da zona.
* [ ] Mostrar prompt somente quando houver interação disponível.
* [ ] Esconder prompt durante diálogos.
* [ ] Executar callback quando o jogador apertar E/Quadrado.
* [ ] Permitir desativar interação após uso.
* [ ] Permitir interação condicional, por exemplo:

    * [ ] portal só aparece após 3 fragmentos
    * [ ] oficina só abre após todos os pets
    * [ ] poder temporal só funciona após ser desbloqueado

---

## 4.6 SceneTransitionManager

* [ ] Criar `src/systems/sceneTransitionManager.ts`.
* [ ] Implementar fade para preto.
* [ ] Implementar fade a partir do preto.
* [ ] Implementar fade branco/azulado para o portal.
* [ ] Implementar transição de cena com callback.
* [ ] Implementar transição interna de cômodo na HomeScene.
* [ ] Garantir que input fique bloqueado durante transição.

---

# 5. UI global

## 5.1 DialogueBox

* [ ] Criar ou revisar `src/ui/dialogueBox.ts`.
* [ ] Renderizar moldura de diálogo.
* [ ] Renderizar retrato quando existir.
* [ ] Renderizar nome do personagem quando existir.
* [ ] Renderizar texto da fala.
* [ ] Renderizar indicador de avanço.
* [ ] Usar profundidade acima do HUD.
* [ ] Esconder quando não houver diálogo ativo.
* [ ] Garantir leitura confortável na TV.
* [ ] Não usar efeito de digitação lento demais.
* [ ] Permitir fala sem retrato.

---

## 5.2 InteractionPrompt

* [ ] Criar `src/ui/interactionPrompt.ts`.

* [ ] Renderizar caixa pequena de comando contextual.

* [ ] Exibir textos como:

    * [ ] `Pressione Quadrado / E para interagir`
    * [ ] `Pressione Quadrado / E para libertar`
    * [ ] `Pressione Quadrado / E para atravessar o portal`
    * [ ] `Pressione Círculo / F para usar`

* [ ] Posicionar na parte inferior ou próxima ao personagem.

* [ ] Esconder quando não houver interação.

* [ ] Esconder durante diálogo.

* [ ] Esconder durante transição.

* [ ] Usar profundidade correta.

---

## 5.3 GameHud

* [ ] Criar ou revisar `src/ui/gameHud.ts`.

* [ ] Renderizar celular compacto.

* [ ] Renderizar ícone de gato.

* [ ] Renderizar contador de gatos encontrados.

* [ ] Renderizar ícone de cachorro.

* [ ] Renderizar contador de cachorros encontrados.

* [ ] Renderizar ícone de família.

* [ ] Renderizar contador de familiares encontrados.

* [ ] Renderizar corações de vida.

* [ ] Atualizar HUD sempre que:

    * [ ] pet for resgatado
    * [ ] familiar for resgatado
    * [ ] Danubia perder vida
    * [ ] cena for reiniciada
    * [ ] progresso for carregado

* [ ] Esconder HUD no menu.

* [ ] Exibir HUD durante gameplay.

* [ ] Permitir esconder HUD durante tela final, se necessário.

---

## 5.4 PhoneChecklist

* [ ] Criar ou revisar `src/ui/phoneChecklist.ts`.
* [ ] Renderizar celular expandido.
* [ ] Renderizar título `DESAPARECIDOS`.
* [ ] Renderizar seção de cachorros.
* [ ] Renderizar Pudim.
* [ ] Renderizar Drogo.
* [ ] Renderizar Pirata.
* [ ] Renderizar seção de gatos.
* [ ] Renderizar Zoe.
* [ ] Renderizar Batata.
* [ ] Renderizar Pituca.
* [ ] Renderizar Brecko.
* [ ] Renderizar Lelo.
* [ ] Renderizar Pure.
* [ ] Renderizar seção de família.
* [ ] Renderizar Filho.
* [ ] Renderizar Filha.
* [ ] Renderizar Marido.
* [ ] Renderizar seção de presente.
* [ ] Renderizar item `???`.
* [ ] Marcar itens encontrados com check.
* [ ] Abrir checklist com Tab/Touchpad/Select.
* [ ] Fechar checklist com Tab/Touchpad/Select.
* [ ] Abrir automaticamente por 2 segundos após resgate.
* [ ] Bloquear movimento enquanto checklist estiver aberta.
* [ ] Não permitir que checklist sobreponha diálogo final de forma confusa.
* [ ] Criar variação final para `Checklist concluída`.

---

# 6. Personagem jogável — Danubia

## 6.1 Classe Danubia

* [x] Criar ou revisar `src/characters/Danubia.ts`.
* [x] Criar sprite com física Arcade.
* [x] Definir corpo físico.
* [x] Ajustar tamanho do corpo para colisão justa.
* [x] Ajustar offset do corpo físico.
* [x] Definir colisão com limites do mundo.
* [ ] Configurar profundidade de personagem.

---

## 6.2 Movimento lateral

* [x] Aplicar velocidade para esquerda.
* [x] Aplicar velocidade para direita.
* [x] Parar horizontalmente quando não houver input.
* [x] Virar sprite para esquerda quando andar para esquerda.
* [x] Virar sprite para direita quando andar para direita.
* [x] Tocar animação de caminhada enquanto anda no chão.
* [x] Voltar para idle quando parar.

---

## 6.3 Pulo

* [x] Permitir pular somente quando estiver no chão.
* [x] Aplicar velocidade vertical de pulo.
* [x] Trocar sprite/animação para pulo.
* [x] Impedir pulo infinito.
* [x] Garantir que o pulo seja fácil, não punitivo.
* [ ] Garantir que o tutorial de pulo funcione em Montmartre ou na casa.

---

## 6.4 Bloqueios de estado

* [x] Criar flag para bloquear movimento.
* [ ] Bloquear movimento durante diálogos.
* [ ] Bloquear movimento durante transições.
* [ ] Bloquear movimento durante checklist aberta.
* [ ] Bloquear movimento durante cutscenes.
* [ ] Liberar movimento ao terminar cada estado.

---

## 6.5 Dano

* [ ] Criar método para receber dano.
* [ ] Trocar sprite para `danubia-damage`.
* [ ] Reduzir vida.
* [ ] Atualizar HUD.
* [ ] Fazer sprite piscar.
* [ ] Ativar invencibilidade temporária.
* [ ] Impedir dano repetido durante invencibilidade.
* [ ] Restaurar sprite após invencibilidade.
* [ ] Se vida chegar a zero, chamar fluxo de falha.

---

## 6.6 Poder temporal

* [ ] Criar método para usar poder temporal.
* [ ] Permitir uso somente se `hasTemporalPower` for verdadeiro.
* [ ] Tocar animação `danubia-power`.
* [ ] Criar efeito visual do pulso dourado.
* [ ] Aplicar cooldown curto para evitar spam.
* [ ] Detectar âncora vulnerável próxima.
* [ ] Desativar âncora se estiver no alcance correto.
* [ ] Não usar como ataque contra Monsieur diretamente.

---

# 7. MenuScene

## 7.1 Estrutura visual

* [x] Exibir background `cover.png` em tela cheia.

* [x] Garantir que cubra 960 × 540.

* [x] Aplicar pixel art sem suavização.

* [x] Renderizar texto principal:

    * [x] `Pressione X ou Espaço para começar`

* [x] Renderizar texto secundário opcional:

    * [x] `Use controle de PlayStation ou teclado`

* [ ] Criar leve piscar no texto principal.

* [x] Não exibir HUD.

* [x] Não exibir checklist.

---

## 7.2 Entrada do jogador

* [x] Detectar X do controle.
* [x] Detectar Espaço no teclado.
* [x] Ao confirmar, fazer fade para preto.
* [x] Iniciar `HomeScene`.
* [ ] Passar localização inicial `living-room`.
* [ ] Salvar checkpoint `home` ao iniciar novo jogo.
* [ ] Garantir que Esc/Options não faça nada crítico no menu.

---

# 8. HomeScene — Base da casa

## 8.1 Estrutura interna da cena

* [ ] Criar sistema interno de cômodos.

* [ ] Definir cômodos:

    * [ ] `living-room`
    * [ ] `hall`
    * [ ] `son-bedroom`
    * [ ] `daughter-bedroom`
    * [ ] `office`

* [ ] Criar método para trocar background.

* [ ] Criar método para limpar interações do cômodo anterior.

* [ ] Criar método para criar interações do novo cômodo.

* [ ] Criar método para reposicionar Danubia.

* [ ] Usar fade curto entre cômodos.

* [ ] Manter a mesma `HomeScene`, sem criar scene separada por quarto.

---

## 8.2 Backgrounds da casa

* [x] Renderizar sala com `bg-home-living-room`.
* [ ] Renderizar corredor com `bg-home-hall`.
* [ ] Renderizar quarto do filho com `bg-home-son-bedroom`.
* [ ] Renderizar quarto da filha com `bg-home-daughter-bedroom`.
* [ ] Renderizar escritório com `bg-home-office`.
* [ ] Remover ou substituir background anterior ao trocar de cômodo.
* [ ] Garantir que o background fique atrás de tudo.

---

## 8.3 Física da casa

* [ ] Criar chão invisível em cada cômodo.
* [x] Criar limites laterais.
* [ ] Ajustar posição inicial de Danubia por cômodo.
* [ ] Garantir que Danubia não caia fora da tela.
* [ ] Garantir que Danubia possa andar e pular em todos os cômodos.
* [ ] Não exigir plataforma difícil dentro da casa.

---

## 8.4 Abertura narrativa da casa

* [ ] Ao entrar pela primeira vez, iniciar tela escura.

* [ ] Exibir texto:

    * [ ] `29 de junho de 2026.`

* [ ] Exibir texto:

    * [ ] `No aniversário de Danubia, algo muito estranho aconteceu.`

* [ ] Exibir texto:

    * [ ] `Todo mundo desapareceu.`

* [ ] Fazer fade para a sala.

* [ ] Posicionar Danubia no centro.

* [ ] Iniciar diálogo inicial:

    * [ ] `Gente?`
    * [ ] `Pudim? Zoe? Alguém?`
    * [ ] `Nove animais nessa casa e nenhum barulho.`
    * [ ] `Ou eu ainda estou dormindo... ou aconteceu alguma coisa muito séria.`

* [ ] Após diálogo, liberar movimento.

---

## 8.5 Tutorial contextual da casa

* [ ] Após o diálogo inicial, mostrar:

    * [ ] `Use o analógico ou as setas para andar.`

* [ ] Ao se aproximar da saída para o corredor, mostrar:

    * [ ] `Pressione Quadrado / E para interagir.`

* [ ] Esconder tutorial de movimento após alguns segundos ou após a primeira movimentação.

* [ ] Não repetir tutorial toda vez que voltar à sala.

---

## 8.6 Interações opcionais da sala

* [ ] Criar zona invisível no sofá.

* [ ] Ao interagir com sofá, exibir:

    * [ ] `Nem sinal dos gatos no sofá. Isso já é suspeito.`

* [ ] Criar zona invisível nos potes dos animais.

* [ ] Ao interagir com potes, exibir:

    * [ ] `Os potes estão cheios. Então eles não sumiram por causa de comida.`
    * [ ] `Pela primeira vez.`

* [ ] Criar zona invisível no relógio da sala.

* [ ] Ao interagir com relógio, exibir:

    * [ ] `Esse relógio está parado?`

* [ ] Criar zona invisível de saída para o corredor.

* [ ] Ao interagir com saída, trocar para `hall`.

---

# 9. HomeScene — Corredor

## 9.1 Entrada no corredor

* [ ] Renderizar background do corredor.

* [ ] Posicionar Danubia perto da entrada correta.

* [ ] Criar chão invisível.

* [ ] Criar portas invisíveis.

* [ ] Exibir diálogo de primeira entrada:

    * [ ] `Tá. Vamos por partes.`
    * [ ] `Se isso for uma surpresa de aniversário, ela está ficando muito elaborada.`

* [ ] Garantir que esse diálogo aconteça só uma vez.

---

## 9.2 Portas do corredor

* [ ] Criar porta para sala.
* [ ] Criar porta para quarto do filho.
* [ ] Criar porta para quarto da filha.
* [ ] Criar porta para escritório.
* [ ] Cada porta deve mostrar prompt de interação.
* [ ] Cada porta deve trocar cômodo com fade.
* [ ] Cada porta deve reposicionar Danubia no destino.
* [ ] Permitir que o jogador visite os quartos em qualquer ordem.
* [ ] Permitir entrar no escritório antes de ter todos os fragmentos.
* [ ] Impedir portal antes de coletar os três fragmentos.

---

# 10. HomeScene — Fragmentos

## 10.1 Sistema de fragmentos

* [ ] Criar controle de fragmentos coletados.
* [ ] Verificar no estado se fragmento já foi coletado.
* [ ] Renderizar apenas fragmentos ainda não coletados.
* [ ] Fazer fragmentos flutuarem levemente.
* [ ] Criar brilho ou rotação sutil.
* [ ] Criar zona de coleta por proximidade.
* [ ] Mostrar prompt ao se aproximar.
* [ ] Ao coletar:

    * [ ] esconder fragmento
    * [ ] incrementar contador
    * [ ] salvar progresso
    * [ ] mostrar mensagem de coleta
    * [ ] atualizar estado da cena

---

## 10.2 Quarto do filho

* [ ] Renderizar background do quarto do filho.

* [ ] Criar chão invisível.

* [ ] Posicionar Danubia perto da porta.

* [ ] Exibir diálogo de primeira entrada:

    * [ ] `Ele não está aqui.`
    * [ ] `E nem arrumou o quarto antes de desaparecer. Interessante.`

* [ ] Criar fragmento 1 próximo à cama ou escrivaninha.

* [ ] Ao coletar fragmento 1, exibir:

    * [ ] `Fragmento de tempo encontrado: 1/3`

* [ ] Voltar para corredor pela porta.

---

## 10.3 Quarto da filha

* [ ] Renderizar background do quarto da filha.

* [ ] Criar chão invisível.

* [ ] Posicionar Danubia perto da porta.

* [ ] Exibir diálogo de primeira entrada:

    * [ ] `Também sumiu...`
    * [ ] `Certo. Agora isso definitivamente virou uma missão.`

* [ ] Criar fragmento 2.

* [ ] Ao coletar fragmento 2, exibir:

    * [ ] `Fragmento de tempo encontrado: 2/3`

* [ ] Voltar para corredor pela porta.

---

## 10.4 Escritório antes dos três fragmentos

* [ ] Renderizar background do escritório.

* [ ] Criar chão invisível.

* [ ] Posicionar Danubia perto da porta.

* [ ] Exibir diálogo de primeira entrada:

    * [ ] `Ele também não está aqui.`
    * [ ] `Pronto. Sumiu todo mundo no meu aniversário.`

* [ ] Criar fragmento 3.

* [ ] Ao coletar fragmento 3, exibir:

    * [ ] `Fragmento de tempo encontrado: 3/3`

* [ ] Se ainda não houver três fragmentos, permitir voltar ao corredor normalmente.

* [ ] Se os três fragmentos forem coletados, iniciar sequência do relógio completo.

---

## 10.5 Relógio completo

* [ ] Detectar quando `collectedFragments` chegar a 3.

* [ ] Bloquear movimento da Danubia.

* [ ] Mover visualmente os fragmentos para o centro da tela.

* [ ] Criar efeito de giro.

* [ ] Ocultar fragmentos individuais.

* [ ] Exibir `effect-clock-complete`.

* [ ] Exibir mensagem:

    * [ ] `Os fragmentos começaram a girar...`

* [ ] Tocar sequência da ligação de Monsieur Minuit.

* [ ] Garantir que essa sequência aconteça apenas uma vez.

---

## 10.6 Ligação de Monsieur Minuit

* [ ] Abrir diálogo com retratos.

* [ ] Exibir fala de Monsieur:

    * [ ] `Bon anniversaire, Madame Danubia.`

* [ ] Exibir fala de Danubia:

    * [ ] `Quem é você?`

* [ ] Exibir fala de Monsieur:

    * [ ] `Pode me chamar de Monsieur Minuit. Sua família está comigo.`

* [ ] Exibir fala de Danubia:

    * [ ] `Você sequestrou todo mundo?`

* [ ] Exibir fala de Monsieur:

    * [ ] `"Sequestro" é uma palavra bastante deselegante.`

* [ ] Exibir fala de Danubia:

    * [ ] `É sério isso? E eu tenho que buscar todo mundo no meu aniversário?`

* [ ] Exibir fala de Monsieur:

    * [ ] `Tecnicamente...`

* [ ] Exibir fala de Danubia:

    * [ ] `Não dava para simplesmente mandar eles virem?`

* [ ] Exibir fala de Monsieur:

    * [ ] `Mas daí o jogo acaba.`

* [ ] Exibir fala de Danubia:

    * [ ] `Ah. Verdade.`

* [ ] Exibir fala de Monsieur:

    * [ ] `Venha até Paris. Seus fragmentos abrirão o caminho.`

* [ ] Exibir fala de Danubia:

    * [ ] `Você sequestra minha família, aparece com esse bigode e ainda quer que eu vá até Paris?`

* [ ] Exibir fala de Monsieur:

    * [ ] `Sim.`

* [ ] Exibir fala de Danubia:

    * [ ] `Tá bom. Estou indo.`

* [ ] Após ligação, exibir:

    * [ ] `Pelo menos é Paris.`

---

## 10.7 Portal da casa

* [ ] Criar portal com `effect-time-portal`.

* [ ] Posicionar portal no centro ou próximo ao computador.

* [ ] Animar portal:

    * [ ] escala pulsando
    * [ ] rotação lenta
    * [ ] brilho
    * [ ] partículas simples opcionais

* [ ] Criar zona invisível de interação no portal.

* [ ] Mostrar prompt:

    * [ ] `Pressione Quadrado / E para atravessar o portal.`

* [ ] Ao interagir:

    * [ ] salvar checkpoint `paris-montmartre`
    * [ ] fazer fade branco/azulado
    * [ ] iniciar `MontmartreScene`

---

# 11. Estrutura base das cenas de Paris

## 11.1 Base comum para Montmartre, Sena e Jardim

* [ ] Criar função ou classe auxiliar para cena de resgate.

* [ ] Renderizar background da cena.

* [ ] Criar Danubia.

* [ ] Criar chão invisível.

* [ ] Criar limites laterais.

* [ ] Criar HUD.

* [ ] Criar checklist.

* [ ] Criar dialogueController.

* [ ] Criar interactionController.

* [ ] Criar prompt contextual.

* [ ] Criar pets dentro de bolhas temporais.

* [ ] Implementar resgate de pet:

    * [ ] detectar aproximação
    * [ ] mostrar prompt
    * [ ] tremer bolha
    * [ ] sumir bolha com fade
    * [ ] animar pet com pequeno salto
    * [ ] marcar pet no estado
    * [ ] salvar progresso
    * [ ] abrir checklist automática por 2 segundos
    * [ ] atualizar HUD
    * [ ] fazer pet sumir em partículas ou fade

* [ ] Criar zona de saída à direita.

* [ ] Só permitir saída após objetivo da cena estar completo.

* [ ] Salvar checkpoint correto ao sair.

---

# 12. MontmartreScene

## 12.1 Entrada da cena

* [ ] Renderizar `bg-paris-montmartre`.

* [ ] Posicionar Danubia saindo do portal à esquerda.

* [ ] Criar breve efeito de chegada do portal.

* [ ] Exibir diálogo:

    * [ ] `Paris...`
    * [ ] `Eu sempre quis vir para cá, mas imaginava uma viagem com menos sequestros.`

* [ ] Exibir mensagem do celular:

    * [ ] `Checklist atualizada.`
    * [ ] `Encontre os desaparecidos.`

* [ ] Liberar movimento.

---

## 12.2 Montmartre — Pudim

* [ ] Posicionar Pudim perto de uma plataforma baixa.

* [ ] Criar bolha temporal envolvendo Pudim.

* [ ] Criar pequena plataforma ou ponto que ensine pulo simples.

* [ ] Ao se aproximar, mostrar:

    * [ ] `Pressione Quadrado / E para libertar.`

* [ ] Ao interagir:

    * [ ] tremer bolha
    * [ ] sumir bolha
    * [ ] animar Pudim
    * [ ] marcar `pudim` como encontrado
    * [ ] atualizar cachorros para `1/3`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Pudim!`
        * [ ] `Um encontrado. Faltam... muitos.`

* [ ] Remover Pudim da tela com fade/partículas.

---

## 12.3 Montmartre — Zoe

* [ ] Posicionar Zoe sobre ou perto da área do café.

* [ ] Criar bolha temporal envolvendo Zoe.

* [ ] Ao se aproximar, mostrar prompt de libertar.

* [ ] Ao interagir:

    * [ ] tremer bolha
    * [ ] sumir bolha
    * [ ] marcar `zoe` como encontrada
    * [ ] atualizar gatos para `1/6`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Zoe?`
        * [ ] `Você foi sequestrada e decidiu sentar em um café?`
        * [ ] `Zoe: Miau.`
        * [ ] `Paris mexeu com você.`

* [ ] Remover Zoe da tela com fade/partículas.

---

## 12.4 Montmartre — Drogo

* [ ] Posicionar Drogo próximo a uma barreira temporal.

* [ ] Criar bolha temporal ou área congelada de Drogo.

* [ ] Criar barreira temporal usando `effect-time-barrier`.

* [ ] Criar ponto de interação para desligar barreira.

* [ ] Ao se aproximar da barreira, exibir diálogo:

    * [ ] `Drogo, espera! Eu vou tirar você daí.`

* [ ] Ao interagir no ponto correto:

    * [ ] desligar barreira
    * [ ] liberar acesso a Drogo

* [ ] Ao interagir com Drogo:

    * [ ] sumir bolha
    * [ ] marcar `drogo` como encontrado
    * [ ] atualizar cachorros para `2/3`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Muito bem. Agora volte para casa e não enfrente nenhum relojoeiro francês sem mim.`

* [ ] Remover Drogo da tela com fade/partículas.

---

## 12.5 Montmartre — Fechamento

* [ ] Detectar quando Pudim, Zoe e Drogo forem resgatados.

* [ ] Tocar ligação/mensagem de Monsieur:

    * [ ] `Eles deveriam ter permanecido perfeitamente imóveis.`
    * [ ] `Você tentou manter nove animais imóveis?`
    * [ ] `Foi um erro de planejamento.`

* [ ] Liberar saída à direita.

* [ ] Ao chegar à saída:

    * [ ] salvar checkpoint `paris-seine`
    * [ ] fazer fade
    * [ ] iniciar `SeineScene`

---

# 13. SeineScene

## 13.1 Entrada da cena

* [ ] Renderizar `bg-paris-seine`.

* [ ] Posicionar Danubia à esquerda.

* [ ] Criar chão invisível.

* [ ] Criar plataformas simples sobre:

    * [ ] calçada
    * [ ] barcos
    * [ ] caixas
    * [ ] malas

* [ ] Criar área de água.

* [ ] Se Danubia cair na água:

    * [ ] reposicionar no último ponto seguro
    * [ ] não causar Game Over definitivo
    * [ ] opcionalmente perder um coração ou apenas reposicionar

* [ ] Exibir diálogo:

    * [ ] `Margem do Sena.`
    * [ ] `Espero que ninguém espere que eu atravesse isso nadando.`

---

## 13.2 Seine — Pirata

* [ ] Posicionar Pirata dentro ou próximo ao barco.

* [ ] Criar bolha temporal envolvendo Pirata.

* [ ] Ao se aproximar, mostrar prompt de libertar.

* [ ] Ao interagir:

    * [ ] tremer bolha
    * [ ] sumir bolha
    * [ ] marcar `pirata` como encontrado
    * [ ] atualizar cachorros para `3/3`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Pirata em um barco.`
        * [ ] `Claro.`

* [ ] Exibir mensagem:

    * [ ] `Todos os cachorros foram encontrados.`

* [ ] Remover Pirata da tela.

---

## 13.3 Seine — Batata

* [ ] Posicionar Batata perto da barraca de comida.

* [ ] Criar bolha temporal envolvendo Batata.

* [ ] Ao se aproximar, mostrar prompt.

* [ ] Ao interagir:

    * [ ] sumir bolha
    * [ ] marcar `batata` como encontrada
    * [ ] atualizar gatos para `2/6`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Batata...`
        * [ ] `Você não tentou escapar. Você veio comer.`
        * [ ] `Batata: Miau.`
        * [ ] `Resolvemos isso depois.`

* [ ] Remover Batata da tela.

---

## 13.4 Seine — Pituca

* [ ] Posicionar Pituca entre caixas ou malas.

* [ ] Criar bolha temporal envolvendo Pituca.

* [ ] Ao se aproximar, mostrar prompt.

* [ ] Ao interagir:

    * [ ] sumir bolha
    * [ ] marcar `pituca` como encontrada
    * [ ] atualizar gatos para `3/6`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Pituca! Encontrei você.`
        * [ ] `Tá tudo bem. A mamãe chegou.`

* [ ] Remover Pituca da tela.

---

## 13.5 Seine — Mensagem misteriosa

* [ ] Detectar quando Pirata, Batata e Pituca forem resgatados.

* [ ] Exibir mensagem do celular:

    * [ ] `Você está procurando apenas quem desapareceu...`
    * [ ] `ou também o momento que perdeu?`

* [ ] Exibir fala de Danubia:

    * [ ] `Eu nem sei o que isso significa.`

* [ ] Liberar saída à direita.

* [ ] Ao sair:

    * [ ] salvar checkpoint `paris-garden`
    * [ ] fazer fade
    * [ ] iniciar `GardenScene`

---

# 14. GardenScene

## 14.1 Entrada da cena

* [ ] Renderizar `bg-paris-garden`.
* [ ] Posicionar Danubia à esquerda.
* [ ] Criar chão invisível.
* [ ] Criar limites.
* [ ] Exibir diálogo:

    * [ ] `Esse lugar tem cara de quem guarda segredos.`
    * [ ] `E provavelmente gatos.`

---

## 14.2 Prisão temporal coletiva

* [ ] Posicionar sprite `brecko-lelo-pure`.
* [ ] Criar bolha temporal grande envolvendo o grupo.
* [ ] Criar três interruptores temporais.
* [ ] Posicionar interruptores em pontos diferentes do jardim.
* [ ] Criar estado de interruptores ativados.
* [ ] A bolha deve começar totalmente visível.
* [ ] A cada interruptor ativado:

    * [ ] tocar feedback visual
    * [ ] aplicar tint no interruptor
    * [ ] tremer bolha
    * [ ] reduzir opacidade da bolha
    * [ ] salvar estado local da cena

---

## 14.3 Interruptor 1

* [ ] Criar zona invisível do interruptor 1.
* [ ] Mostrar prompt de interação.
* [ ] Ao ativar:

    * [ ] marcar interruptor 1 como ativo
    * [ ] exibir:

        * [ ] `A prisão temporal ficou mais fraca.`

---

## 14.4 Interruptor 2

* [ ] Criar zona invisível do interruptor 2.
* [ ] Mostrar prompt de interação.
* [ ] Ao ativar:

    * [ ] marcar interruptor 2 como ativo
    * [ ] exibir:

        * [ ] `Quase lá.`

---

## 14.5 Interruptor 3

* [ ] Criar zona invisível do interruptor 3.

* [ ] Mostrar prompt de interação.

* [ ] Ao ativar:

    * [ ] marcar interruptor 3 como ativo
    * [ ] exibir:

        * [ ] `O tempo voltou a correr.`

* [ ] Remover bolha temporal.

* [ ] Animar Brecko/Lelo/Pure com salto e fade.

---

## 14.6 Resgate coletivo dos gatos

* [ ] Marcar `brecko` como encontrado.

* [ ] Marcar `lelo` como encontrado.

* [ ] Marcar `pure` como encontrado.

* [ ] Atualizar gatos para `6/6`.

* [ ] Abrir checklist automática mostrando:

    * [ ] `Brecko encontrado`
    * [ ] `Lelo encontrado`
    * [ ] `Pure encontrado`

* [ ] Exibir mensagem:

    * [ ] `Todos os animais foram encontrados!`

* [ ] Exibir diálogo:

    * [ ] `Brecko, Lelo e Pure...`
    * [ ] `Os três juntos. É claro.`
    * [ ] `Um de cada vez!`
    * [ ] `Os três ignoraram completamente.`
    * [ ] `Eu deveria ter imaginado.`

---

## 14.7 Caminho para a oficina

* [ ] Após todos os animais, ativar entrada da oficina.

* [ ] Exibir mensagem do celular:

    * [ ] `Sinal temporal localizado.`
    * [ ] `Destino: Oficina de Monsieur Minuit.`

* [ ] Exibir fala:

    * [ ] `Então é lá que todo mundo está.`

* [ ] Criar zona de interação da oficina.

* [ ] Mostrar prompt para entrar.

* [ ] Ao interagir:

    * [ ] salvar checkpoint `workshop`
    * [ ] fazer fade
    * [ ] iniciar `WorkshopScene`

---

# 15. WorkshopScene — Setup

## 15.1 Entrada visual

* [ ] Renderizar `bg-paris-workshop`.
* [ ] Posicionar Danubia à esquerda.
* [ ] Posicionar Monsieur no centro ou à direita.
* [ ] Posicionar filho ao fundo.
* [ ] Posicionar filha ao fundo.
* [ ] Posicionar marido ao fundo.
* [ ] Aplicar tint azul claro nos familiares.
* [ ] Aplicar alpha levemente reduzido nos familiares.
* [ ] Criar bolha temporal sobre cada familiar.
* [ ] Aplicar flutuação leve nos familiares.
* [ ] Criar partículas simples opcionais ao redor das bolhas.

---

## 15.2 Entrada narrativa

* [ ] Bloquear movimento no início.

* [ ] Exibir diálogo:

    * [ ] `Então era isso.`
    * [ ] `Você congelou todo mundo.`
    * [ ] `Eu preservei este instante.`
    * [ ] `Sem pedir para ninguém.`
    * [ ] `Momentos perfeitos sempre acabam.`
    * [ ] `Pessoas mudam. Filhos crescem. Animais chegam, envelhecem, partem.`
    * [ ] `Eu apenas impeço que o tempo estrague aquilo que é bonito.`
    * [ ] `Impedindo todo mundo de viver?`
    * [ ] `Mantendo tudo exatamente como deveria ser.`
    * [ ] `Exatamente como deveria ser não existe.`

* [ ] Fazer Monsieur ativar o relógio.

* [ ] Desbloquear poder temporal.

* [ ] Marcar `hasTemporalPower` como verdadeiro.

* [ ] Salvar progresso.

---

## 15.3 Tutorial do poder temporal

* [ ] Exibir mensagem:

    * [ ] `Novo poder desbloqueado: Pulso de Afeto`
    * [ ] `Pressione Círculo / F para usar.`

* [ ] Mostrar prompt contextual quando Danubia se aproximar da primeira âncora.

* [ ] Garantir que o jogador entenda que deve usar o poder, não interagir com E.

---

# 16. WorkshopScene — Sistema da batalha

## 16.1 Âncoras temporais

* [ ] Criar três âncoras usando `effect-time-anchor`.

* [ ] Apenas uma âncora deve estar vulnerável por vez.

* [ ] Âncoras não vulneráveis devem parecer apagadas ou bloqueadas.

* [ ] Âncora vulnerável deve:

    * [ ] brilhar
    * [ ] pulsar
    * [ ] permitir uso do poder temporal

* [ ] Criar zona de alcance do poder em cada âncora.

* [ ] Ao usar poder próximo da âncora vulnerável:

    * [ ] tocar animação de Danubia
    * [ ] exibir pulso dourado
    * [ ] desativar âncora
    * [ ] avançar fase da batalha

---

## 16.2 Sistema de vida na batalha

* [ ] Iniciar batalha com 3 corações.

* [ ] Atualizar HUD de corações.

* [ ] Ao encostar em obstáculo:

    * [ ] aplicar dano
    * [ ] piscar Danubia
    * [ ] ativar invencibilidade por 1 segundo
    * [ ] reduzir coração

* [ ] Ao chegar a 0 corações:

    * [ ] parar obstáculos

    * [ ] mostrar mensagem:

        * [ ] `Ops! Nem toda missão funciona na primeira tentativa.`

    * [ ] reiniciar no checkpoint `workshop`

    * [ ] não repetir cutscene completa

    * [ ] exibir fala curta:

        * [ ] `De novo. Agora eu já sei como esse relógio funciona.`

---

## 16.3 Obstáculos gerais

* [ ] Criar grupo de obstáculos.
* [ ] Permitir spawn por fase.
* [ ] Permitir limpar obstáculos ao trocar fase.
* [ ] Criar colisão entre Danubia e obstáculos.
* [ ] Garantir que obstáculos sejam simples e legíveis.
* [ ] Garantir que a batalha não fique difícil demais.
* [ ] Parar todos os obstáculos ao vencer.

---

# 17. WorkshopScene — Fase 1: Filho

## 17.1 Setup da fase 1

* [ ] Ativar primeira âncora.
* [ ] Deixar filho congelado ao fundo.
* [ ] Criar obstáculos:

    * [ ] despertador
    * [ ] calendário

---

## 17.2 Despertador

* [ ] Criar sprite `hazard-alarm-clock`.
* [ ] Fazer despertador pular horizontalmente.
* [ ] Definir colisão com Danubia.
* [ ] Reiniciar posição se sair da tela.
* [ ] Velocidade deve ser baixa ou média.

---

## 17.3 Calendário

* [ ] Criar sprite `hazard-calendar`.
* [ ] Fazer calendário atravessar a tela lentamente.
* [ ] Definir colisão com Danubia.
* [ ] Reiniciar posição se sair da tela.
* [ ] Movimento deve ser previsível.

---

## 17.4 Libertar filho

* [ ] Ao desativar primeira âncora:

    * [ ] remover bolha do filho
    * [ ] remover tint azul do filho
    * [ ] marcar `son` como resgatado
    * [ ] atualizar família para `1/3`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Mãe!`
        * [ ] `Eu te achei.`

* [ ] Limpar obstáculos da fase 1.

* [ ] Avançar para fase 2.

---

# 18. WorkshopScene — Fase 2: Filha

## 18.1 Setup da fase 2

* [ ] Ativar segunda âncora.
* [ ] Deixar filha congelada ao fundo.
* [ ] Criar obstáculos:

    * [ ] engrenagem
    * [ ] reunião virtual

---

## 18.2 Engrenagem

* [ ] Criar sprite `hazard-gear`.
* [ ] Fazer engrenagem rolar pelo chão.
* [ ] Aplicar rotação visual.
* [ ] Definir colisão com Danubia.
* [ ] Reiniciar posição ao sair da tela.
* [ ] Movimento deve ser previsível.

---

## 18.3 Reunião virtual

* [ ] Criar sprite `hazard-meeting`.
* [ ] Fazer janela de reunião descer de cima.
* [ ] Fazer janela subir novamente.
* [ ] Definir colisão com Danubia.
* [ ] Criar intervalo entre aparições.
* [ ] Movimento deve ser engraçado, não injusto.

---

## 18.4 Libertar filha

* [ ] Ao desativar segunda âncora:

    * [ ] remover bolha da filha
    * [ ] remover tint azul da filha
    * [ ] marcar `daughter` como resgatada
    * [ ] atualizar família para `2/3`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Você conseguiu!`
        * [ ] `Ainda falta acabar com esse relógio.`

* [ ] Limpar obstáculos da fase 2.

* [ ] Avançar para fase 3.

---

# 19. WorkshopScene — Fase 3: Marido

## 19.1 Setup da fase 3

* [ ] Ativar terceira âncora.
* [ ] Deixar marido congelado ao fundo.
* [ ] Criar obstáculos:

    * [ ] ponteiro
    * [ ] nuvem
    * [ ] engrenagem opcional

---

## 19.2 Ponteiro

* [ ] Criar sprite `hazard-clock-hand`.
* [ ] Fazer ponteiro girar ou varrer uma área.
* [ ] Definir área segura clara.
* [ ] Definir colisão com Danubia.
* [ ] Movimento deve ser visualmente compreensível.

---

## 19.3 Nuvem

* [ ] Criar sprite `hazard-cloud`.

* [ ] Fazer nuvem se mover no alto.

* [ ] Opcionalmente criar raio simples por código.

* [ ] Se houver raio:

    * [ ] exibir aviso visual curto
    * [ ] criar colisão apenas durante o raio
    * [ ] remover raio depois

* [ ] Movimento deve ser simples.

---

## 19.4 Libertar marido

* [ ] Ao desativar terceira âncora:

    * [ ] remover bolha do marido
    * [ ] remover tint azul do marido
    * [ ] marcar `husband` como resgatado
    * [ ] atualizar família para `3/3`
    * [ ] abrir checklist automática
    * [ ] exibir diálogo:

        * [ ] `Você chegou.`
        * [ ] `Claro que cheguei. Vocês sumiram no meu aniversário.`

* [ ] Limpar todos os obstáculos.

* [ ] Encerrar batalha.

---

# 20. WorkshopScene — Encerramento da batalha

## 20.1 Vitória visual

* [ ] Parar spawn de obstáculos.
* [ ] Destruir obstáculos restantes.
* [ ] Tremer câmera.
* [ ] Reduzir brilho do relógio.
* [ ] Trocar Monsieur para `monsieur-defeated`.
* [ ] Atualizar HUD:

    * [ ] gatos `6/6`
    * [ ] cachorros `3/3`
    * [ ] família `3/3`

---

## 20.2 Diálogo final com Monsieur

* [ ] Exibir diálogo:

    * [ ] `Agora o momento terminará.`
    * [ ] `Sim.`
    * [ ] `E isso não assusta você?`
    * [ ] `Um pouco.`
    * [ ] `Mas depois desse momento vem outro. E depois outro.`
    * [ ] `Minha família não precisa ficar parada para continuar sendo minha família.`
    * [ ] `Passei tanto tempo tentando guardar momentos...`
    * [ ] `...que esqueci de vivê-los.`
    * [ ] `Ainda dá tempo.`

* [ ] Salvar checkpoint `ending`.

* [ ] Iniciar `EndingScene`.

---

# 21. EndingScene

## 21.1 Setup visual

* [ ] Renderizar `bg-paris-workshop`.

* [ ] Aplicar overlay dourado transparente.

* [ ] Posicionar Danubia usando `danubia-victory` ou idle.

* [ ] Posicionar filho.

* [ ] Posicionar filha.

* [ ] Posicionar marido.

* [ ] Posicionar Monsieur em estado derrotado ou calmo.

* [ ] Posicionar pets:

    * [ ] Pudim
    * [ ] Zoe
    * [ ] Drogo
    * [ ] Pirata
    * [ ] Batata
    * [ ] Pituca
    * [ ] Brecko/Lelo/Pure

* [ ] Fazer personagens aparecerem com fade-in.

* [ ] Fazer animais darem pequenos saltos ou flutuação leve.

* [ ] Não exigir animação complexa para todos.

---

## 21.2 Diálogo final da família

* [ ] Exibir fala do filho:

    * [ ] `Então... feliz aniversário!`

* [ ] Exibir fala da filha:

    * [ ] `Desculpa pelo sequestro.`

* [ ] Exibir fala do marido:

    * [ ] `Essa parte não estava no planejamento.`

* [ ] Exibir fala de Danubia:

    * [ ] `Espero mesmo que não.`

* [ ] Exibir fala do marido:

    * [ ] `A gente queria preparar uma surpresa.`

* [ ] Exibir fala do filho:

    * [ ] `Uma coisa para acompanhar você nos próximos momentos.`

* [ ] Exibir fala da filha:

    * [ ] `Nos engraçados, nos importantes...`

* [ ] Exibir fala do filho:

    * [ ] `...e até nos completamente caóticos.`

* [ ] Exibir fala de Monsieur:

    * [ ] `Então não tentem fazer este momento durar para sempre.`

* [ ] Exibir fala de Monsieur:

    * [ ] `Apenas façam valer a pena.`

---

## 21.3 Checklist final

* [ ] Abrir celular expandido automaticamente.

* [ ] Mostrar título:

    * [ ] `Checklist concluída`

* [ ] Mostrar:

    * [ ] `✓ 6 gatos`
    * [ ] `✓ 3 cachorros`
    * [ ] `✓ 1 filho`
    * [ ] `✓ 1 filha`
    * [ ] `✓ 1 marido`
    * [ ] `[ ] 1 presente`

* [ ] Fazer item do presente piscar.

* [ ] Após alguns segundos, mostrar:

    * [ ] `O último item não está dentro do jogo.`

* [ ] Depois mostrar:

    * [ ] `MISSÃO FINAL:`
    * [ ] `Olhe para sua família.`

* [ ] Pausar progressão do jogo nesse momento.

* [ ] Esperar input manual após entrega física do celular.

---

## 21.4 Depois da entrega física

* [ ] Quando alguém apertar E/Quadrado:

    * [ ] marcar presente como encontrado
    * [ ] mostrar:

        * [ ] `✓ Presente encontrado!`

* [ ] Depois mostrar:

    * [ ] `Novos momentos desbloqueados.`

* [ ] Mostrar tela final:

    * [ ] `Feliz aniversário, Danubia.`
    * [ ] `Nós amamos você.`

* [ ] Mostrar crédito opcional:

    * [ ] `Criado com amor pela sua família.`

---

## 21.5 Reinício

* [ ] Mostrar opções:

    * [ ] `Pressione X / Espaço para jogar novamente.`
    * [ ] `Pressione Esc para sair da tela cheia.`

* [ ] Ao apertar X/Espaço:

    * [ ] resetar progresso ou iniciar novo jogo
    * [ ] voltar para `MenuScene` ou `HomeScene`

* [ ] Ao apertar Esc:

    * [ ] sair da tela cheia, se estiver em tela cheia
    * [ ] não quebrar o jogo se não estiver em tela cheia

---

# 22. Polimento mínimo obrigatório

## 22.1 Legibilidade

* [ ] Verificar se textos estão legíveis em TV.
* [ ] Aumentar fonte se necessário.
* [ ] Garantir contraste suficiente em diálogos.
* [ ] Garantir que prompts não fiquem em cima de elementos importantes.
* [ ] Garantir que checklist caiba na tela.

---

## 22.2 Sensação de pixel art

* [ ] Garantir `pixelArt: true`.
* [ ] Garantir `roundPixels: true`.
* [ ] Evitar escala quebrada demais nos sprites principais.
* [ ] Evitar suavização dos assets.
* [ ] Conferir backgrounds em tela cheia.

---

## 22.3 Feedback visual

* [ ] Fragmentos devem flutuar.
* [ ] Bolhas devem tremer ao interagir.
* [ ] Portal deve pulsar.
* [ ] Âncoras vulneráveis devem brilhar.
* [ ] Checklist deve abrir automaticamente após resgates.
* [ ] HUD deve atualizar imediatamente.
* [ ] Dano deve piscar Danubia.
* [ ] Vitória deve ter tremor de câmera ou efeito visível.

---

## 22.4 Dificuldade

* [ ] Testar se pessoa não gamer consegue jogar.
* [ ] Reduzir velocidade de obstáculos se necessário.
* [ ] Aumentar áreas de interação se necessário.
* [ ] Evitar pulos precisos.
* [ ] Garantir que cair na água não seja frustrante.
* [ ] Garantir que a batalha final seja clara.

---

# 23. Testes de fluxo completo

## 23.1 Teste do início ao portal

* [ ] Abrir jogo.
* [ ] Entrar no menu.
* [ ] Começar jogo.
* [ ] Assistir abertura.
* [ ] Andar na sala.
* [ ] Interagir com objetos opcionais.
* [ ] Ir ao corredor.
* [ ] Entrar no quarto do filho.
* [ ] Coletar fragmento 1.
* [ ] Voltar ao corredor.
* [ ] Entrar no quarto da filha.
* [ ] Coletar fragmento 2.
* [ ] Voltar ao corredor.
* [ ] Entrar no escritório.
* [ ] Coletar fragmento 3.
* [ ] Assistir ligação de Monsieur.
* [ ] Atravessar portal.

---

## 23.2 Teste de Montmartre

* [ ] Confirmar checkpoint `paris-montmartre`.
* [ ] Resgatar Pudim.
* [ ] Resgatar Zoe.
* [ ] Desligar barreira de Drogo.
* [ ] Resgatar Drogo.
* [ ] Conferir HUD.
* [ ] Conferir checklist.
* [ ] Receber mensagem de Monsieur.
* [ ] Sair para Sena.

---

## 23.3 Teste do Sena

* [ ] Confirmar checkpoint `paris-seine`.
* [ ] Resgatar Pirata.
* [ ] Confirmar cachorros `3/3`.
* [ ] Resgatar Batata.
* [ ] Resgatar Pituca.
* [ ] Conferir gatos `3/6`.
* [ ] Cair na água e confirmar retorno ao ponto seguro.
* [ ] Receber mensagem misteriosa.
* [ ] Sair para jardim.

---

## 23.4 Teste do Jardim

* [ ] Confirmar checkpoint `paris-garden`.
* [ ] Encontrar Brecko/Lelo/Pure.
* [ ] Ativar interruptor 1.
* [ ] Ativar interruptor 2.
* [ ] Ativar interruptor 3.
* [ ] Confirmar resgate dos três gatos.
* [ ] Confirmar gatos `6/6`.
* [ ] Conferir mensagem de todos os animais encontrados.
* [ ] Entrar na oficina.

---

## 23.5 Teste da Oficina

* [ ] Confirmar checkpoint `workshop`.
* [ ] Assistir cutscene inicial.
* [ ] Confirmar desbloqueio do poder temporal.
* [ ] Desativar âncora 1.
* [ ] Libertar filho.
* [ ] Desativar âncora 2.
* [ ] Libertar filha.
* [ ] Desativar âncora 3.
* [ ] Libertar marido.
* [ ] Confirmar família `3/3`.
* [ ] Testar dano.
* [ ] Testar invencibilidade.
* [ ] Testar perda de todos os corações.
* [ ] Confirmar retry sem repetir cutscene inteira.
* [ ] Vencer batalha.
* [ ] Assistir diálogo final com Monsieur.
* [ ] Ir para EndingScene.

---

## 23.6 Teste do final

* [ ] Confirmar checkpoint `ending`.

* [ ] Ver família reunida.

* [ ] Ver animais reunidos.

* [ ] Assistir diálogo final.

* [ ] Ver checklist concluída.

* [ ] Ver item do presente piscando.

* [ ] Ver mensagem:

    * [ ] `O último item não está dentro do jogo.`

* [ ] Ver missão final:

    * [ ] `Olhe para sua família.`

* [ ] Confirmar que o jogo espera input.

* [ ] Após entrega física, apertar E/Quadrado.

* [ ] Ver:

    * [ ] `✓ Presente encontrado!`
    * [ ] `Novos momentos desbloqueados.`
    * [ ] `Feliz aniversário, Danubia.`
    * [ ] `Nós amamos você.`

---

# 24. Testes técnicos finais

## 24.1 Controle

* [ ] Testar controle PlayStation conectado.
* [ ] Testar analógico esquerdo.
* [ ] Testar direcional.
* [ ] Testar X para pular/confirmar.
* [ ] Testar Quadrado para interagir/avançar diálogo.
* [ ] Testar Círculo para poder temporal.
* [ ] Testar Touchpad/Select para checklist.
* [ ] Testar Options para pausa, se implementado.

---

## 24.2 Teclado

* [ ] Testar A/D.
* [ ] Testar setas.
* [ ] Testar Espaço.
* [ ] Testar E.
* [ ] Testar F.
* [ ] Testar Tab.
* [ ] Testar Esc.

---

## 24.3 Save e checkpoints

* [ ] Fechar jogo após chegar em Montmartre e recarregar.
* [ ] Fechar jogo após chegar no Sena e recarregar.
* [ ] Fechar jogo após chegar no Jardim e recarregar.
* [ ] Fechar jogo após chegar na Oficina e recarregar.
* [ ] Confirmar que o progresso de pets não se perde.
* [ ] Confirmar que o progresso da família não se perde.
* [ ] Confirmar que vidas resetam corretamente após checkpoint.
* [ ] Confirmar que save corrompido não quebra o jogo.

---

## 24.4 Build final

* [ ] Rodar build de produção.
* [ ] Corrigir erros de TypeScript.
* [ ] Corrigir imports quebrados.
* [ ] Corrigir assets com caminho errado.
* [ ] Abrir build localmente.
* [ ] Testar em tela cheia.
* [ ] Testar espelhamento para TV.
* [ ] Confirmar que a resolução mantém proporção 16:9.
* [ ] Confirmar que a imagem não fica cortada.
* [ ] Confirmar que textos continuam legíveis na TV.

---

# 25. Ordem recomendada de execução no Codex

## Milestone 1 — Jogo abrindo

* [x] Corrigir exports das cenas.
* [x] Registrar cenas no config.
* [x] Fazer BootScene carregar somente assets essenciais do menu e sala.
* [x] Fazer MenuScene aparecer.
* [x] Fazer botão iniciar levar para HomeScene.
* [x] Fazer HomeScene renderizar sala.

---

## Milestone 2 — Danubia jogável

* [x] Criar Danubia.
* [x] Implementar movimento lateral.
* [x] Implementar pulo.
* [x] Implementar chão invisível.
* [x] Implementar limites.
* [x] Testar movimento na sala.

---

## Milestone 3 — Interações e cômodos

* [ ] Criar InteractionPrompt.
* [ ] Criar InteractionController.
* [ ] Criar troca de cômodo.
* [ ] Implementar sala.
* [ ] Implementar corredor.
* [ ] Implementar portas.
* [ ] Implementar quartos.
* [ ] Implementar escritório.

---

## Milestone 4 — Diálogos

* [ ] Criar DialogueBox.
* [ ] Criar DialogueController.
* [ ] Implementar diálogo inicial.
* [ ] Implementar diálogos opcionais da casa.
* [ ] Implementar diálogos dos quartos.
* [ ] Implementar ligação de Monsieur.

---

## Milestone 5 — Fragmentos e portal

* [ ] Implementar fragmento 1.
* [ ] Implementar fragmento 2.
* [ ] Implementar fragmento 3.
* [ ] Implementar contador de fragmentos.
* [ ] Implementar relógio completo.
* [ ] Implementar portal.
* [ ] Ir para Montmartre.

---

## Milestone 6 — HUD e checklist

* [ ] Criar GameHud.
* [ ] Criar PhoneChecklist.
* [ ] Integrar com estado global.
* [ ] Abrir checklist com Tab/Select.
* [ ] Atualizar checklist em resgates.
* [ ] Atualizar HUD em tempo real.

---

## Milestone 7 — Montmartre

* [ ] Implementar background.
* [ ] Implementar Pudim.
* [ ] Implementar Zoe.
* [ ] Implementar Drogo.
* [ ] Implementar barreira temporal.
* [ ] Implementar mensagem de Monsieur.
* [ ] Ir para Sena.

---

## Milestone 8 — Sena

* [ ] Implementar background.
* [ ] Implementar plataformas simples.
* [ ] Implementar água com retorno ao ponto seguro.
* [ ] Implementar Pirata.
* [ ] Implementar Batata.
* [ ] Implementar Pituca.
* [ ] Implementar mensagem misteriosa.
* [ ] Ir para Jardim.

---

## Milestone 9 — Jardim

* [ ] Implementar background.
* [ ] Implementar Brecko/Lelo/Pure.
* [ ] Implementar bolha grande.
* [ ] Implementar três interruptores.
* [ ] Implementar resgate coletivo.
* [ ] Liberar entrada da oficina.

---

## Milestone 10 — Oficina

* [ ] Implementar background.
* [ ] Posicionar Monsieur.
* [ ] Posicionar família congelada.
* [ ] Implementar cutscene inicial.
* [ ] Desbloquear poder temporal.
* [ ] Implementar âncoras.
* [ ] Implementar obstáculos fase 1.
* [ ] Libertar filho.
* [ ] Implementar obstáculos fase 2.
* [ ] Libertar filha.
* [ ] Implementar obstáculos fase 3.
* [ ] Libertar marido.
* [ ] Implementar derrota/retry.
* [ ] Implementar vitória.
* [ ] Implementar diálogo final com Monsieur.

---

## Milestone 11 — Final

* [ ] Implementar EndingScene.

* [ ] Reunir família.

* [ ] Reunir pets.

* [ ] Implementar diálogo final.

* [ ] Implementar checklist final.

* [ ] Implementar missão:

    * [ ] `Olhe para sua família.`

* [ ] Implementar confirmação pós-presente.

* [ ] Implementar tela final.

* [ ] Implementar reinício.

---

## Milestone 12 — Polimento e teste na TV

* [ ] Ajustar textos.
* [ ] Ajustar colisões.
* [ ] Ajustar velocidade da Danubia.
* [ ] Ajustar pulo.
* [ ] Ajustar dificuldade da oficina.
* [ ] Ajustar tamanho dos prompts.
* [ ] Ajustar HUD.
* [ ] Testar controle.
* [ ] Testar teclado.
* [ ] Testar build.
* [ ] Testar na TV.
* [ ] Fazer playthrough completo de 10 a 15 minutos.
