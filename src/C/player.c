#include "game.h"

float player_x = 5.5f;
float player_y = 5.5f;

const float SPRITE_SIZE = 16.0f; 

int current_frame_x = 0; 
int current_frame_y = 0; 
int flip_h = 0; // Nova variável para controlar o espelhamento
float anim_counter = 0.0f;

__attribute__((visibility("default"))) float get_player_x() { return player_x; }
__attribute__((visibility("default"))) float get_player_y() { return player_y; }

__attribute__((visibility("default"))) int get_sprite_flip_h() { 
    return flip_h; 
}

float custom_abs(float v) {
    return v < 0.0f ? -v : v;
}

__attribute__((visibility("default"))) void move_player(float dx, float dy) {
    float next_x = player_x + dx;
    float next_y = player_y + dy;

    if (next_x >= 0.0f && next_x <= (float)GRID_SIZE) player_x = next_x;
    if (next_y >= 0.0f && next_y <= (float)GRID_SIZE) player_y = next_y;

    if (dx != 0.0f || dy != 0.0f) {
        if (custom_abs(dx) > custom_abs(dy)) {
            // Eixo Horizontal (Direita e Esquerda usam a mesma linha)
            current_frame_y = 2; 
            if (dx > 0) {
                flip_h = 0; // Direita (Normal)
            } else {
                flip_h = 1; // Esquerda (Espelhado)
            }
        } else {
            // Eixo Vertical
            if (dy > 0) current_frame_y = 0; 
            else        current_frame_y = 1; 
            flip_h = 0; // Retira o espelhamento ao andar para cima/baixo
        }

        anim_counter += 0.15f; 
        if (anim_counter >= 4.0f) anim_counter = 0.0f;
        current_frame_x = 1 + (int)anim_counter; 
        
    } else {
        current_frame_x = 0;
        anim_counter = 0.0f;
    }
}

__attribute__((visibility("default"))) float get_sprite_sx() { return (float)current_frame_x * SPRITE_SIZE; }
__attribute__((visibility("default"))) float get_sprite_sy() { return (float)current_frame_y * SPRITE_SIZE; }