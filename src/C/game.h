#ifndef GAME_H
#define GAME_H

#define TILE_WIDTH 32.0f
#define TILE_HEIGHT 32.0f
#define GRID_SIZE 15
// Estrutura para as coordenadas de corte do sprite no spritesheet
typedef struct {
    float sx, sy, sw, sh;
} SpriteCoords;

void move_player(float dx, float dy);
float get_player_x();
float get_player_y();
int get_grid_size();

void set_camera_trig(float cy, float sy, float cp, float sp);
float get_screen_x(float x, float y, float z, float offset_x);
float get_screen_y(float x, float y, float z, float offset_y);

float get_sprite_sx();
float get_sprite_sy();
int get_sprite_flip_h();

void update_animation();

#endif