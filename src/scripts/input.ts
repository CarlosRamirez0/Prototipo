export const inputState = {
    up: false, down: false, left: false, right: false,
    zoom: 1.0,
    cameraYaw: 0.0,
    cameraPitch: 0.615 // ~35.26º radianos (Isométrico padrão do Habbo)
};

export function setupInput(canvas: HTMLCanvasElement): void {
    let isDragging = false;

    // Impede o menu do Windows de abrir ao soltar o botão direito dentro do jogo
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
        if (e.button === 2) isDragging = true; // 2 = Botão direito
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
        if (isDragging) {
            const sensitivity = 0.005;
            inputState.cameraYaw -= e.movementX * sensitivity;
            
            // Limita o pitch (vertical) entre 0.1 (quase rasante) e 1.5 (visão de cima total)
            inputState.cameraPitch = Math.max(0.1, Math.min(1.5, inputState.cameraPitch + e.movementY * sensitivity));
        }
    });

    window.addEventListener('mouseup', (e: MouseEvent) => {
        if (e.button === 2) isDragging = false;
    });

    const setKey = (code: string, isDown: boolean) => {
        switch(code) {
            case 'KeyW': case 'ArrowUp': inputState.up = isDown; break;
            case 'KeyS': case 'ArrowDown': inputState.down = isDown; break;
            case 'KeyA': case 'ArrowLeft': inputState.left = isDown; break;
            case 'KeyD': case 'ArrowRight': inputState.right = isDown; break;
        }
    };
    window.addEventListener('keydown', (e) => setKey(e.code, true));
    window.addEventListener('keyup', (e) => setKey(e.code, false));

    window.addEventListener('wheel', (e) => {
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        inputState.zoom = Math.max(0.5, Math.min(3.0, inputState.zoom + zoomDelta));
    });
}