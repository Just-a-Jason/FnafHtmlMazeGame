const EDITMODE_TILES_LIST = document.querySelector('.scroll-view');
const GRID_SIZE = 800;

const CANVAS = document.querySelector('#gameCanvas');
const DIALOGBOX_HOLDER = document.querySelector('.dialogBoxHolder');
const EDIT_MODE_UI_ELEMENTS = document.querySelector('.editBoxUIElements');

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
    GfLaugh:new Audio('Sounds/gflaugh.ogg'),
    Dialog:new Audio('Sounds/dialog.ogg')
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
    Bonnie: new Sprite('Sprites/Characters/Bonnie.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    Foxy:new Sprite('Sprites/Characters/Foxy.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    NightmareFoxy:new Sprite('Sprites/Characters/NightmareFoxy.png', new Offset(0,5),OBJECT_TYPE.Solid,TAGS.Entity),
    Springtrap:new Sprite('Sprites/Characters/Springtrap.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    Cupcake:new Sprite('Sprites/Characters/Cupcake.png', new Offset(10,10),OBJECT_TYPE.Solid, TAGS.Entity),
    Empty: new Sprite("Sprites/empty.png", new Offset(0,0),OBJECT_TYPE.Empty),
    Cherry: new Sprite('Sprites/Collectable/cherry.png', new Offset(6,6), OBJECT_TYPE.Collectable),
    Guard: new Sprite('Sprites/guard.png', new Offset(10,10), OBJECT_TYPE.Solid, TAGS.Player),
};

const AI_TYPE = {
    Chase:0,
    Wander:1,
    Teleport:2
};

const GRID_SCAN_MODE = {
    Cross:[[0,-1],[-1,0],[+1,0],[0,+1]],
    Full:[[-1, -1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
}

const ENTITIES = {
    NightmareFoxy: new Entity(SPRITES.NightmareFoxy, AI_TYPE.Wander, [new Dialog("I'm always lurking in the shadows, ready to strike.", '#f00')]),
    GoldenFreddy:new Entity(SPRITES.GoldenFreddy, AI_TYPE.Teleport, [new Dialog("It's me... haunting your dreams.")]),
    Cupcake:new Entity(SPRITES.Cupcake, AI_TYPE.Wander, [new Dialog("I may be small, but I'm full of mischief and sweetness.","#cc16c5")]),
    Bonnie:new Entity(SPRITES.Bonnie,  AI_TYPE.Wander, [new Dialog("The music... it soothes my soul and fuels my mischief.", "#00f")]),
    Freddy:new Entity(SPRITES.Freddy,  AI_TYPE.Wander, [new Dialog("Welcome to Freddy Fazbear's Pizza, where fantasy and fun come to life!", "#964B00")]),
    Chica: new Entity(SPRITES.Chica, AI_TYPE.Wander, [new Dialog("I'll make sure you're stuffed... with delicious pizza!", "#ff0")]),
    Foxy:new Entity(SPRITES.Foxy, AI_TYPE.Wander, [new Dialog("Arrr, ye better watch yer back, matey. I'm always ready to run!", "#f00")]),
    Springtrap: new Entity(SPRITES.Springtrap, AI_TYPE.Wander, [new Dialog("A new beginning, but the past always finds a way to catch up.", "#0a7e1d")]),
};