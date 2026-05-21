import type{ GameWasm } from './types.js';
import { inputState } from './input.js';
import { textures } from './assets.js';
// Tipo para a Fila de Renderização
interface RenderItem {
    type: 'floor' | 'wall' | 'player';
    x: number;
    y: number;
    baseScreenY: number; // Y no chão (z=0) usado para decidir quem fica na frente
}

function drawBlock(ctx: CanvasRenderingContext2D, wasm: GameWasm, lx: number, ly: number, heightZ: number, offsetX: number, offsetY: number, baseColor: string, isTransparent: boolean): void {
    ctx.globalAlpha = isTransparent ? 0.0 : 1.0;

    // Calcula os 4 pontos da base (Z=0)
    const b1x = wasm.get_screen_x(lx, ly, 0, offsetX);
    const b1y = wasm.get_screen_y(lx, ly, 0, offsetY);
    const b2x = wasm.get_screen_x(lx + 1, ly, 0, offsetX);
    const b2y = wasm.get_screen_y(lx + 1, ly, 0, offsetY);
    const b3x = wasm.get_screen_x(lx + 1, ly + 1, 0, offsetX);
    const b3y = wasm.get_screen_y(lx + 1, ly + 1, 0, offsetY);
    const b4x = wasm.get_screen_x(lx, ly + 1, 0, offsetX);
    const b4y = wasm.get_screen_y(lx, ly + 1, 0, offsetY);

    // Calcula os 4 pontos do topo (Z=heightZ)
    const t1x = wasm.get_screen_x(lx, ly, heightZ, offsetX);
    const t1y = wasm.get_screen_y(lx, ly, heightZ, offsetY);
    const t2x = wasm.get_screen_x(lx + 1, ly, heightZ, offsetX);
    const t2y = wasm.get_screen_y(lx + 1, ly, heightZ, offsetY);
    const t3x = wasm.get_screen_x(lx + 1, ly + 1, heightZ, offsetX);
    const t3y = wasm.get_screen_y(lx + 1, ly + 1, heightZ, offsetY);
    const t4x = wasm.get_screen_x(lx, ly + 1, heightZ, offsetX);
    const t4y = wasm.get_screen_y(lx, ly + 1, heightZ, offsetY);

    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 0.5;

    const drawFace = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, p4x: number, p4y: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.lineTo(p3x, p3y); ctx.lineTo(p4x, p4y); ctx.closePath();
        ctx.fill(); ctx.stroke();
    };

    // Desenha as faces laterais (Simulação básica sem Backface Culling perfeito para manter a performance)
    drawFace(b1x, b1y, b2x, b2y, t2x, t2y, t1x, t1y, baseColor); // Parede Esquerda
    drawFace(b2x, b2y, b3x, b3y, t3x, t3y, t2x, t2y, '#90a4ae'); // Parede Direita
    drawFace(b3x, b3y, b4x, b4y, t4x, t4y, t3x, t3y, baseColor); // Parede Traseira Direita
    drawFace(b4x, b4y, b1x, b1y, t1x, t1y, t4x, t4y, '#90a4ae'); // Parede Traseira Esquerda

    // Topo sempre por último
    drawFace(t1x, t1y, t2x, t2y, t3x, t3y, t4x, t4y, '#cfd8dc'); 

    ctx.globalAlpha = 1.0; // Restaura opacidade
}

function drawPlayer(ctx: CanvasRenderingContext2D, wasm: GameWasm, px: number, py: number, offsetX: number, offsetY: number): void {
    const screenX = wasm.get_screen_x(px + 0.5, py + 0.5, 0, offsetX);
    const screenY = wasm.get_screen_y(px + 0.5, py + 0.5, 0, offsetY);
    
    const sx = wasm.get_sprite_sx();
    const sy = wasm.get_sprite_sy();
    const isFlipped = wasm.get_sprite_flip_h() === 1; // Verifica a flag do C
    
    const sw = 16;
    const sh = 16;
    const spritesheet = textures['base_man']; 
    if (!spritesheet) return;

    ctx.imageSmoothingEnabled = false;

    const destWidth = 32;
    const destHeight = destWidth * (sh / sw); 
    
    const drawX = screenX - (destWidth / 2);
    const drawY = screenY - destHeight; 

    // Se estiver virado para a esquerda, aplica a matriz de espelhamento
    if (isFlipped) {
        ctx.save(); // Salva o estado atual (sem espelhamento)
        
        // Inverte o eixo X do Canvas
        ctx.scale(-1, 1);
        
        // Como o universo inteiro está invertido, passamos a coordenada de X negativa e subtraímos a largura
        ctx.drawImage(
            spritesheet, 
            sx, sy, sw, sh,
            -drawX - destWidth, drawY, destWidth, destHeight 
        );
        
        ctx.restore(); // Desfaz a inversão para não afetar os próximos blocos da sala
    } else {
        // Renderização normal (Frente, Costas e Direita)
        ctx.drawImage(
            spritesheet, 
            sx, sy, sw, sh,
            drawX, drawY, destWidth, destHeight          
        );
    }
}
export function renderWorld(ctx: CanvasRenderingContext2D, wasm: GameWasm, canvasWidth: number, canvasHeight: number): void {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save(); 

    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(inputState.zoom, inputState.zoom);
    ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

    const gridSize = wasm.get_grid_size();
    const px = wasm.get_player_x();
    const py = wasm.get_player_y();
    
    // Calcula o offset para centralizar no jogador (Z=0)
    const rawPlayerX = wasm.get_screen_x(px + 0.5, py + 0.5, 0, 0);
    const rawPlayerY = wasm.get_screen_y(px + 0.5, py + 0.5, 0, 0);
    const cameraOffsetX = (canvasWidth / 2) - rawPlayerX;
    const cameraOffsetY = (canvasHeight / 2) - rawPlayerY;

    // Base Y do jogador usado para testar quem está na frente dele
    const playerBaseScreenY = wasm.get_screen_y(px + 0.5, py + 0.5, 0, cameraOffsetY);

    // 1. Popula a fila de renderização
    const renderQueue: RenderItem[] = [];
     renderQueue.push({ type: 'player', x: px, y: py, baseScreenY: playerBaseScreenY });

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            // O centro matemático do bloco define a profundidade dele
            const baseScreenY = wasm.get_screen_y(x + 0.5, y + 0.5, 0, cameraOffsetY);
            
            // Chão
            renderQueue.push({ type: 'floor', x, y, baseScreenY });

            // Se for a borda da grade, cria uma parede no mesmo bloco
            if (x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1) {
                renderQueue.push({ type: 'wall', x, y, baseScreenY });
            }
        }
    }

    // Adiciona o jogador na fila
   

    // 2. ORDENAÇÃO DE PROFUNDIDADE (Z-Sort via Screen Y)
    // O menor Y (mais no topo da tela, mais distante) é desenhado primeiro
    renderQueue.sort((a, b) => a.baseScreenY - b.baseScreenY);

    // 3. Renderiza seguindo a ordem
    for (const item of renderQueue) {
        if (item.type === 'floor') {
            const color = (item.x + item.y) % 2 === 0 ? '#b0bec5' : '#9ea9b0';
            // Altura 0 = Polígono achatado no chão
            drawBlock(ctx, wasm, item.x, item.y, 0, cameraOffsetX, cameraOffsetY, color, false);
        } 
        else if (item.type === 'player') {
            drawPlayer(ctx, wasm, item.x, item.y, cameraOffsetX, cameraOffsetY);
        } 
        else if (item.type === 'wall') {
            // Se a base da parede vai ser desenhada APÓS a base do jogador (Y maior), ela está ocluindo a visão.
            const isOccluding = item.baseScreenY > playerBaseScreenY;
            
            // Altura 2 = Duas vezes a altura de um bloco (Tile Height)
            drawBlock(ctx, wasm, item.x, item.y, 1.5, cameraOffsetX, cameraOffsetY, '#78909c', isOccluding);
        }
    }

    ctx.restore();
}