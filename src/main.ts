import { setupInput, inputState } from './scripts/input.js';
import { renderWorld } from './scripts/render.js';
import type{ GameWasm } from './scripts/types.js';
import { loadAssets } from './scripts/assets.js'; // Importe a nova função

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

async function initWasm(): Promise<void> {
    await loadAssets();
    const response = await fetch(`bin/game.wasm?t=${Date.now()}`);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.instantiate(buffer);
    const wasm = module.instance.exports as GameWasm;

    setupInput(canvas); // Passa o canvas para neutralizar o contextmenu

    const moveSpeed = 0.05; 

    function gameLoop(): void {
        // Envia as atualizações trigonométricas do mouse para o C
        wasm.set_camera_trig(
            Math.cos(inputState.cameraYaw),
            Math.sin(inputState.cameraYaw),
            Math.cos(inputState.cameraPitch),
            Math.sin(inputState.cameraPitch)
        );

        let dirX = 0;
        let dirY = 0;

        if (inputState.up)    dirY -= 1;
        if (inputState.down)  dirY += 1;
        if (inputState.left)  dirX -= 1;
        if (inputState.right) dirX += 1;

        // REMOVA O IF AQUI. Execute o cálculo e chame o wasm sempre.
        const compX = dirX * Math.cos(-inputState.cameraYaw) - dirY * Math.sin(-inputState.cameraYaw);
        const compY = dirX * Math.sin(-inputState.cameraYaw) + dirY * Math.cos(-inputState.cameraYaw);

        // Se estiver parado, magnitude é 0, então evitamos a divisão por zero
        const magnitude = Math.sqrt(compX * compX + compY * compY);
        const finalDx = magnitude === 0 ? 0 : (compX / magnitude) * moveSpeed;
        const finalDy = magnitude === 0 ? 0 : (compY / magnitude) * moveSpeed;

        // O C agora recebe (0,0) quando o jogador solta o teclado, o que zera a animação
        wasm.move_player(finalDx, finalDy);

        renderWorld(ctx, wasm, canvas.width, canvas.height);
        requestAnimationFrame(gameLoop);}

    requestAnimationFrame(gameLoop);
}

initWasm().catch(console.error);