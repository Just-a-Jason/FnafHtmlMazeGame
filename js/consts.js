const editModeUI = document.querySelector('.editModeUI');
const GRID_SIZE = 800;

const CANVAS = document.querySelector('#gameCanvas');

const TAGS = {
    Entity:0,
    Player:1
};

const LevelSize = {
    Small:100,
    Medium:50,
    Large:30
}

let SINGLE_GRID_CELL_SIZE = LevelSize.Small;
const GRID_ROWS = GRID_SIZE / SINGLE_GRID_CELL_SIZE;

const SOUNDS = {
    Click:new Audio('Sounds/click.ogg'), 
    InvertedMusic:new Audio('Sounds/inverted.ogg'),
    Music:new Audio('Sounds/music.ogg'),
    Collected:new Audio('Sounds/collected.ogg'),
    Movement:new Audio('Sounds/moved.ogg'),
    GfLaugh:new Audio('Sounds/gflaugh.ogg') 
};

const OBJECT_TYPE = {
    Solid:0,
    Collectable:1,
    PowerUp:4,
    Empty: 2,
    Exit:3,
};

const POWERUPS = {
    FlashLight:0
}

const SPRITES = {
    Wall: new Sprite('Sprites/Obstacles/wall.jpg', new Offset(0,0),OBJECT_TYPE.Solid),
    Freddy: new Sprite('Sprites/Characters/Freddy.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    GoldenFreddy: new Sprite('Sprites/Characters/GoldenFreddy.png', new Offset(10,10),OBJECT_TYPE.Collectable, TAGS.Entity),
    Chica: new Sprite('Sprites/Characters/Chica.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    Bonnie: new Sprite('Sprites/Characters/Bonnie.gif', new Offset(15,5),OBJECT_TYPE.Solid, TAGS.Entity),
    Foxy:new Sprite('Sprites/Characters/Foxy.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    NightmareFoxy:new Sprite('Sprites/Characters/NightmareFoxy.png', new Offset(0,5),OBJECT_TYPE.Solid,TAGS.Entity),
    Cupcake:new Sprite('Sprites/Characters/Cupcake.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    Empty: new Sprite("Sprites/empty.png", new Offset(0,0),OBJECT_TYPE.Empty),
    Cherry: new Sprite('Sprites/Collectable/cherry.png', new Offset(6,6), OBJECT_TYPE.Collectable),
    Guard: new Sprite('Sprites/guard.png', new Offset(10,10), OBJECT_TYPE.Solid, TAGS.Player),
};

const AI_TYPE = {
    Chase:0,
    Wander:1,
    Follow:2
};

const ENTITIES = {
    NightmareFoxy: new Entity(SPRITES.NightmareFoxy, AI_TYPE.Wander),
    GoldenFreddy:new Entity(SPRITES.GoldenFreddy, AI_TYPE.Follow),
    Cupcake:new Entity(SPRITES.Cupcake, AI_TYPE.Wander),
    Bonnie:new Entity(SPRITES.Bonnie,  AI_TYPE.Wander),
    Freddy:new Entity(SPRITES.Freddy,  AI_TYPE.Wander),
    Chica: new Entity(SPRITES.Chica, AI_TYPE.Wander),
    Foxy:new Entity(SPRITES.Foxy, AI_TYPE.Wander),
};