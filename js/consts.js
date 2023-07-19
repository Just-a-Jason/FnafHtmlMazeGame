const EDITMODE_TILES_LIST = document.querySelector('.scroll-view');
const GRID_SIZE = 800;

const CANVAS = document.querySelector('#gameCanvas');
const DIALOGBOX_HOLDER = document.querySelector('.dialogBoxHolder');
const EDIT_MODE_UI_ELEMENTS = document.querySelector('.editBoxUIElements');

const CATEGORIES = {
    "Obstacles":4,   
    "Playersprites":0,
    "Characters":1,
    "CollectableItems":2,
    "Powerups":3,
};

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
    Click:new Audio('Sounds/Effects/click.ogg'), 
    InvertedMusic:new Audio('Sounds/Music/inverted.ogg'),
    Music:new Audio('Sounds/Music/music.ogg'),
    Collected:new Audio('Sounds/Effects/collected.ogg'),
    Movement:new Audio('Sounds/Effects/moved.ogg'),
    GfLaugh:new Audio('Sounds/Effects/gflaugh.ogg'),
    Dialog:new Audio('Sounds/Effects/dialog.ogg'),
    Transformation:new Audio("Sounds/Characters/Springtrap/transformation.ogg")
};

// let SpringtapStopms = [];

// for (let i =0; i < 5; i++) {
//     SpringtapStopms.push(new Audio(`Sounds/Characters/Springtrap/Stomp${i}.ogg`));
// }

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
    "Wall": new Sprite('Sprites/Obstacles/wall.jpg', new Offset(0,0),OBJECT_TYPE.Solid, CATEGORIES.Obstacles),
    "Freddy": new Sprite('Sprites/Characters/Freddy.png', new Offset(10,10),OBJECT_TYPE.Solid, CATEGORIES.Characters, TAGS.Entity,),
    "Golden Freddy": new Sprite('Sprites/Characters/GoldenFreddy.png', new Offset(10,10),OBJECT_TYPE.Collectable, CATEGORIES.Characters, TAGS.Entity),
    "Chica": new Sprite('Sprites/Characters/Chica.png', new Offset(10,10),OBJECT_TYPE.Solid, CATEGORIES.Characters, TAGS.Entity),
    "Bonnie": new Sprite('Sprites/Characters/Bonnie.png', new Offset(10,10),OBJECT_TYPE.Solid, CATEGORIES.Characters, TAGS.Entity),
    "Foxy":new Sprite('Sprites/Characters/Foxy.png', new Offset(10,10),OBJECT_TYPE.Solid, CATEGORIES.Characters, TAGS.Entity),
    "Nightmare Foxy":new Sprite('Sprites/Characters/NightmareFoxy.png', new Offset(0,5),OBJECT_TYPE.Solid,CATEGORIES.Characters, TAGS.Entity),
    "William Afton":new Sprite('Sprites/Characters/William.png', new Offset(5,5),OBJECT_TYPE.Solid,CATEGORIES.Characters, TAGS.Entity),
    "Springtrap":new Sprite('Sprites/Characters/Springtrap.png', new Offset(10,10),OBJECT_TYPE.Solid, CATEGORIES.Characters, TAGS.Entity),
    "Cupcake":new Sprite('Sprites/Characters/Cupcake.png', new Offset(10,10),OBJECT_TYPE.Solid, CATEGORIES.Characters, TAGS.Entity),
    "Empty": new Sprite("Sprites/empty.png", new Offset(0,0),OBJECT_TYPE.Empty),
    "Cherry": new Sprite('Sprites/Collectable/cherry.png', new Offset(6,6), OBJECT_TYPE.Collectable, CATEGORIES["CollectableItems"]),
    "Flash Light": new Sprite('Sprites/Powerups/flashlight.png', new Offset(6,6), OBJECT_TYPE.Collectable, CATEGORIES.Powerups),
    "Phone Call": new Sprite('Sprites/Powerups/phone call.png', new Offset(6,6), OBJECT_TYPE.Collectable, CATEGORIES.Powerups),
    "Guard": new Sprite('Sprites/Player/guard.png', new Offset(10,10), OBJECT_TYPE.Solid, CATEGORIES["Playersprites"], TAGS.Player),
    "Purple Guy": new Sprite('Sprites/Player/purple guy.gif', new Offset(10,10), OBJECT_TYPE.Solid, CATEGORIES["Playersprites"], TAGS.Player),
};

const AI_TYPE = {
    Chase:0,
    Wander:1,
    Teleport:2,
};

const GRID_SCAN_MODE = {
    Cross:[[0,-1],[-1,0],[+1,0],[0,+1]],
    Full:[[-1, -1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]
}

const ENTITIES = {
    "Nightmare Foxy": new Entity(SPRITES.NightmareFoxy, AI_TYPE.Wander, [new Dialog("I'm always lurking in the shadows, ready to strike.",undefined, '#f00')]),
    "Golden Freddy":new Entity(SPRITES["Golden Freddy"], AI_TYPE.Teleport, [new Dialog("It's me... haunting your dreams.",undefined)]),
    "Cupcake":new Entity(SPRITES.Cupcake, AI_TYPE.Wander, [new Dialog("I may be small, but I'm full of mischief and sweetness.",undefined,"#cc16c5")]),
    "Bonnie":new Entity(SPRITES.Bonnie,  AI_TYPE.Wander, [new Dialog("The music... it soothes my soul and fuels my mischief.", undefined, "#00f")]),
    "Freddy":new Entity(SPRITES.Freddy,  AI_TYPE.Wander, [new Dialog("Welcome to Freddy Fazbear's Pizza, where fantasy and fun come to life!",undefined, "#964B00")]),
    "Chica": new Entity(SPRITES.Chica, AI_TYPE.Wander, [new Dialog("I'll make sure you're stuffed... with delicious pizza!", undefined, "#ff0")]),
    "Foxy":new Entity(SPRITES.Foxy, AI_TYPE.Wander, [new Dialog("Arrr, ye better watch yer back, matey. I'm always ready to run!", undefined, "#f00")]),
    "Springtrap": new Entity(SPRITES.Springtrap, AI_TYPE.Wander, [new Dialog("Behold the transformation! From human to machine, I emerge as Springtrap, an unstoppable force of terror!",SOUNDS.Transformation,"#0a7e1d")]),
    "William Afton": new Entity(SPRITES["William Afton"] , AI_TYPE.Wander, [new Dialog("Behold the transformation! From human to machine, I emerge as Springtrap, an unstoppable force of terror!",SOUNDS.Transformation,"#0a7e1d")]),
};