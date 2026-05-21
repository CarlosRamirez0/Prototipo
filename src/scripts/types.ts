export interface SpriteCoords {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

export interface GameWasm extends WebAssembly.Exports {
    get_grid_size: () => number;
    get_screen_x: (x: number, y: number, z: number, offset_x: number) => number;
    get_screen_y: (x: number, y: number, z: number, offset_y: number) => number;
    get_player_x: () => number;
    get_player_y: () => number;
    move_player: (dx: number, dy: number) => void;
    set_camera_trig: (cy: number, sy: number, cp: number, sp: number) => void;

    get_sprite_sx: () => number;
    get_sprite_sy: () => number;
    get_sprite_flip_h: () => number; 
    update_animation: () => void;
}