#include "game.h"

float cam_cos_yaw = 1.0f;
float cam_sin_yaw = 0.0f;
float cam_cos_pitch = 0.866f; // Inicializado no padrão ~35 graus
float cam_sin_pitch = 0.5f;

__attribute__((visibility("default"))) void set_camera_trig(float cy, float sy, float cp, float sp) {
    cam_cos_yaw = cy;
    cam_sin_yaw = sy;
    cam_cos_pitch = cp;
    cam_sin_pitch = sp;
}

__attribute__((visibility("default"))) int get_grid_size() { return GRID_SIZE; }
__attribute__((visibility("default"))) float get_screen_x(float x, float y, float z, float offset_x) {
    float cx = x - (GRID_SIZE / 2.0f);
    float cy = y - (GRID_SIZE / 2.0f);
    float rx = cx * cam_cos_yaw - cy * cam_sin_yaw;
    return rx * (TILE_WIDTH / 2.0f) + offset_x;
}

__attribute__((visibility("default"))) float get_screen_y(float x, float y, float z, float offset_y) {
    float cx = x - (GRID_SIZE / 2.0f);
    float cy = y - (GRID_SIZE / 2.0f);
    float ry = cx * cam_sin_yaw + cy * cam_cos_yaw;
    
    // A altura Z desloca o pixel verticalmente para cima na tela
    return ry * (TILE_HEIGHT / 2.0f) * cam_sin_pitch - (z * TILE_HEIGHT) + offset_y;
}