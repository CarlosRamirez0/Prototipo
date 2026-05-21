// Dicionário global para armazenar as texturas carregadas
export const textures: Record<string, HTMLImageElement> = {};

export async function loadAssets(): Promise<void> {
    // Defina os caminhos das imagens
    const assetsToLoad = [
        { id: 'base_man', src: '../src/assets/player/base_man/man_skin_w.png' },
        { id: 'base_woman', src: '../src/assets/player/base_woman/woman_skin_w.png' }
    ];

    const promises = assetsToLoad.map(asset => {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                textures[asset.id] = img;
                resolve();
            };
            img.onerror = () => reject(`Falha ao carregar textura: ${asset.src}`);
            img.src = asset.src;
        });
    });

    await Promise.all(promises);
    console.log("Todas as texturas foram carregadas.");
}