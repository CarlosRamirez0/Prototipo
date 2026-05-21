import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cDir = path.resolve(__dirname, '../C');
const outDir = path.resolve(__dirname, '../../bin');
const outFilePath = path.join(outDir, 'game.wasm');

if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir, { recursive: true });
}

// Coleta todos os arquivos .c da pasta dinamicamente
const cFiles = fs.readdirSync(cDir)
    .filter(file => file.endsWith('.c'))
    .map(file => `"${path.join(cDir, file)}"`)
    .join(' ');

const command = `clang --target=wasm32 -nostdlib "-Wl,--no-entry" "-Wl,--export-all" -o "${outFilePath}" ${cFiles}`;

console.log('Iniciando compilação C -> WebAssembly (Múltiplos arquivos)...');
exec(command, (error, stderr) => {
    if (error) {
        console.error(`[ERRO]: ${error.message}`);
        return;
    }
    if (stderr && stderr.toLowerCase().includes('error')) {
        console.error(`[ERRO DE COMPILAÇÃO]:\n${stderr}`);
        return;
    } else if (stderr) {
        console.warn(`[AVISOS]:\n${stderr}`);
    }
    console.log(`✅ Build concluído! Arquivo gerado em: ${outFilePath}`);
});