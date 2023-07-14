//#region Objects
    class ObjectType {
        constructor(type) {
            this.type = type;
        }
    };

    class Entity {
        constructor(sprite, aiType) {
            this.position = new Vector2(0,0),
            this.overridedSprite = undefined;
            this.lastIDSelected = 0;
            this.sprite = sprite;
            this.aiType = aiType;
        }
    }

    class Vector2 {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
        
        static ToVector2D(array2d) {
            return new Vector2(array2d[0], array2d[1]);
        }
    };

    class Player {
        constructor (sprite, position) {
            this.spawnPosition = position;
            this.position = position;
            this.sprite = sprite;
            this.score = 0;
        }

        SyncPositions() {
            this.spawnPosition = this.position;
        }
    };

    class Offset {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    };

    class Sprite {
        constructor(file, offset, objectType, tag) {
            this.File = file;
            this.Offset = offset;
            this.objectType = objectType;
            this.tag = tag;
        }
    };
//#endregion

//#region Consts
    const editModeUI = document.querySelector('.editModeUI');
    const SINGLE_GRID_CELL_SIZE = 50;
    const GRID_SIZE = 800;

    const CANVAS = document.querySelector('#gameCanvas');
    const GRID_ROWS = GRID_SIZE / SINGLE_GRID_CELL_SIZE;
    const TAGS = {
        Entity:0,
        Player:1
    };


    const SOUNDS = {
        Click:new Audio('Sounds/click.wav'), 
        InvertedMusic:new Audio('Sounds/inverted.ogg'),
        Music:new Audio('Sounds/music.ogg')
    };

    const OBJECT_TYPE = {
        Solid:0,
        Collectable:1,
        Empty: 2,
        Exit:3
    };

    const SPRITES = {
        Wall: new Sprite('Sprites/Obstacles/wall.jpg', new Offset(0,0),OBJECT_TYPE.Solid),
        Freddy: new Sprite('Sprites/Characters/Freddy.png', new Offset(10,5),OBJECT_TYPE.Solid, TAGS.Entity),
        GoldenFreddy: new Sprite('Sprites/Characters/GoldenFreddy.png', new Offset(10,5),OBJECT_TYPE.Collectable, TAGS.Entity),
        Chica: new Sprite('Sprites/Characters/Chica.png', new Offset(20,10),OBJECT_TYPE.Solid, TAGS.Entity),
        Bonnie: new Sprite('Sprites/Characters/Bonnie.gif', new Offset(15,5),OBJECT_TYPE.Solid, TAGS.Entity),
        Foxy:new Sprite('Sprites/Characters/Foxy.png', new Offset(15,10),OBJECT_TYPE.Solid, TAGS.Entity),
        NightmareFoxy:new Sprite('Sprites/Characters/NightmareFoxy.png', new Offset(0,5),OBJECT_TYPE.Solid,TAGS.Entity),
        Cupcake:new Sprite('Sprites/Characters/Cupcake.png', new Offset(40,5),OBJECT_TYPE.Solid, TAGS.Entity),
        Empty: new Sprite("Sprites/empty.png", new Offset(0,0),OBJECT_TYPE.Empty),
        Cherry: new Sprite('Sprites/Collectable/cherry.png', new Offset(6,6), OBJECT_TYPE.Collectable),
        Guard: new Sprite('Sprites/guard.png', new Offset(-10,-10), OBJECT_TYPE.Solid, TAGS.Player)
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
//#endregion

//#region Map
    const EDITMODE_BUTTON = document.querySelector('.editModeButton');
    const EDITMODE_UI = document.querySelector('.editModeUI');
    let AI_ENTITIES = [];
    let checkPattern = [];
    let currentLevel = [];
    let editMode = true;
    let selectedSprite;
    let tmpLevelData;
//#endregion
    
//#region Player Set Up
    const player = new Player(SPRITES.Guard, new Vector2(2,2));
    let lastCellSprite;
    const FOV = 2;
    function ControllPlayer(key) {
        let x = player.position.x;
        let y = player.position.y;

        switch (key) {
            // right
            case 37: x--; break;
            // up
            case 38: y--; break;
            // left
            case 39: x++; break;
            // down
            case 40: y++; break;
        }
        
        if (checkForCollision(x,y)) {
            if (lastCellSprite != undefined) SwapSprite(player.position, lastCellSprite);
            else SwapSprite(player.position, SPRITES.Empty);
    
            lastCellSprite = GetSprite(x,y);
            player.position = new Vector2(x,y);
            
            if (GetSprite(x,y).objectType === OBJECT_TYPE.Collectable) {
                if (GetSprite(x,y) === SPRITES.GoldenFreddy) {
                    for (let cell of document.querySelectorAll('.gridCell')) cell.style.filter = 'invert(1)';
                    RotateLevel(180); 
                    SOUNDS.Music.pause();
                    SOUNDS.InvertedMusic.play();
                    SOUNDS.InvertedMusic.loop = true;
                } 
                
                //can collect item
                lastCellSprite = undefined;
            }

            SwapSprite(player.position, player.sprite);
            RenderGrid();
        }
        RenderGrid();
}
//#endregion

//#region  Game Function 

    function InitGame() {
        document.addEventListener('keydown', (keyEvent) => {
            if (editMode) return; 
            ControllPlayer(keyEvent.keyCode);
        });

        EDITMODE_BUTTON.addEventListener('click', (e) => {
            editMode = !editMode;
            if (editMode) {RotateLevel(0);TurnEditMode();}
            else TurnPlayMode();
            e.currentTarget.innerText = `EDIT MODE: ${(editMode) ? 'ON' : 'OFF'}`;
            EDITMODE_UI.style.opacity = !(editMode) ? '0.5' : '1';
            RenderGrid();
        });

        LoadLevel();
        let canvas = document.createElement('div');
        canvas.classList.add('canvas');
        canvas.style['width'] = GRID_SIZE + "px";
        canvas.style['height'] = GRID_SIZE + "px";

        for (let row = 0; row < GRID_ROWS; row++) {
            let gridRow = document.createElement('div');
            gridRow.classList.add('gridRow');
            for (let cell = 0; cell < GRID_ROWS; cell++) {
                let gridCell = document.createElement('div');
                gridCell.style['width'] = SINGLE_GRID_CELL_SIZE + "px";
                gridCell.style['height'] = SINGLE_GRID_CELL_SIZE + "px";
                
                gridCell.classList.add('gridCell');
                gridCell.setAttribute('x', cell);
                gridCell.setAttribute('y', row);
                let cellImage = document.createElement("img");
                cellImage.style['width'] = SINGLE_GRID_CELL_SIZE - currentLevel[row][cell].Offset.x + "px";
                cellImage.style['height'] = SINGLE_GRID_CELL_SIZE - currentLevel[row][cell].Offset.y  + "px";
                cellImage.classList.add('bluredLevel'); 
                gridCell.appendChild(cellImage);

                // Sprite Editor Logic
                gridCell.addEventListener('click', (e) => {
                    if (!editMode) return;
                    let clickPos = GetGridPosition(e.currentTarget);

                    if (GetSprite(clickPos.x, clickPos.y) === selectedSprite) {
                        if(selectedSprite.tag === TAGS.Player) return;
                        let cell = GetGridCell(clickPos.x, clickPos.y);
                        cell.classList.remove('entity');
                        cell.removeAttribute('entityData');
                        SwapSprite(clickPos, SPRITES.Empty);
                        RenderGrid();
                        return; 
                    }
                    else SwapSprite(clickPos, selectedSprite);
                    
                    if (selectedSprite.tag === TAGS.Player) {
                        SwapSprite(player.position, SPRITES.Empty);
                        player.position = clickPos;
                        player.SyncPositions();
                    }
                    else if (selectedSprite.tag === TAGS.Entity) {
                        let cell = GetGridCell(clickPos.x, clickPos.y);
                        let entityKey = GetEntityKey();
                        let entityInGrid = CheckForEntityInGrid(entityKey);

                        if (entityInGrid[0]) {
                            // swaping the sprite
                            SwapSprite(entityInGrid[1],SPRITES.Empty);
                            let entityCell = GetGridCell(entityInGrid[1].x, entityInGrid[1].y);
                            entityCell.classList.remove('entity');
                            entityCell.removeAttribute('entityData');
                        }

                        cell.classList.add('entity');
                        cell.setAttribute('entityData', entityKey);
                    }

                    RenderGrid();
                });

                gridCell.addEventListener('mouseenter', (e) => { if(!editMode) return; e.currentTarget.classList.add('selectedGridCell');});
                gridCell.addEventListener('mouseleave', (e) => { e.currentTarget.classList.remove('selectedGridCell');});

                gridRow.appendChild(gridCell);
            }
            canvas.appendChild(gridRow);
        }

        CANVAS.appendChild(CreateStaticScreen());
        CANVAS.appendChild(canvas);
        
        // AddEntity(ENTITIES.Foxy, new Vector2(5,6));
        // AddEntity(ENTITIES.Chica, new Vector2(4,4));
        // AddEntity(ENTITIES.Freddy, new Vector2(9,9));
        // AddEntity(ENTITIES.GoldenFreddy, new Vector2(3,2));
        // AddEntity(ENTITIES.NightmareFoxy, new Vector2(4,2));
        // AddEntity(ENTITIES.Bonnie, new Vector2(3,2));

        for (let i = 0; i < GRID_ROWS; i++) {
            checkPattern.push(i % 2 === 0 ? ['#000', '#222'] : ['#222', '#000']);
        }

        AddRandomStuff();
        ColorGrid();
        RenderGrid();
    }

    function GetEntityKey() {
        for (let key of Object.keys(ENTITIES)) {
            if (ENTITIES[key].sprite === selectedSprite)
                return key;
        }
    }

    function CheckForEntityInGrid(entityType) {
        for (let entity of document.querySelectorAll('.entity'))
            if (entity.getAttribute('entityData') === entityType) return [true, GetGridPosition(entity)];
        return [false,undefined];
    }

    function RenderGrid() {
        let rows = document.querySelectorAll('.gridRow');
        for (let row = 0; row < GRID_ROWS; row++) {
            let cells = rows[row].querySelectorAll('.gridCell');
            for (let cell = 0; cell < cells.length; cell++) {
                let sprite = GetSprite(cell, row);
                let cellSprite = cells[cell].querySelector('img');
                let distance = CalculateTheDistance(row,cell);
                
                if (distance > FOV && !editMode) {
                    cells[cell].style.opacity = '0';
                    cellSprite.style.opacity = '0';
                } else {
                    cellSprite.style.height = SINGLE_GRID_CELL_SIZE - sprite.Offset.y + "px";
                    cellSprite.style.width = SINGLE_GRID_CELL_SIZE - sprite.Offset.x + "px";
                    cellSprite.src = sprite.File;
                    cellSprite.style.opacity = '1';
                    cells[cell].style.opacity = '1';
                }
            }
        }
    }

    function LoadLevel() {
        AddFullRow();
        for (let i = 0; i < GRID_ROWS-2; i++) {
            AddBoxedCollumn();
        }
        AddFullRow();
        SwapSprite(player.position, player.sprite);
    }

    function AddBoxedCollumn() {
        let row = [];   
        row.push(SPRITES.Wall);
        for (let i = 0; i < GRID_ROWS-2; i++) {
            row.push(SPRITES.Empty);
        }
        row.push(SPRITES.Wall);
        currentLevel.push(row);
    }

    function AddFullRow() {
        let row = [];    
        for (let i = 0; i < GRID_ROWS; i++) {
            row.push(SPRITES.Wall);
        }
        currentLevel.push(row);
    }

    function AddEntity(entity, position) {
        if (!(position.x < GRID_ROWS && position.y < GRID_ROWS)) {
            console.log(`Cannot spawn entity at x: ${position.x}, y: ${position.y}.`)   
            return;
        }
        SwapSprite(position, entity.sprite);
        entity.position = position;
        AI_ENTITIES.push(entity);
        RenderGrid();
    }

    function checkForCollision(x,y) {
        // collision detection
        return !GetSprite(x,y).objectType == OBJECT_TYPE.Solid;
    }

    function ProcessAllEntities() {
        for (entity of AI_ENTITIES) {
            switch(entity.aiType) {
                case 0:
                    Chase(entity);
                break;
                case 1: 
                    Wander(entity);
                break;
            }   
        }
    }

    function Chase(entity) {
    }

    function Wander(entity) {  
        let freeSpace = ScanGrid(entity.position.x, entity.position.y);
        
        // cannot move
        if (freeSpace.length == 0) return;
        
        let randomChoice = RandInt(freeSpace.length);

        // vector2 Conversion
        let pos = Vector2.ToVector2D(freeSpace[randomChoice]);
        entity.overridedSprite = GetSprite(pos.x, pos.y);

        SwapSprite(pos, entity.sprite);
        
        if (entity.overridedSprite != entity.sprite) SwapSprite(entity.position, entity.overridedSprite);
        else SwapSprite(entity.position, SPRITES.Empty);
        
        entity.position = pos;

        RenderGrid();
    }

    function AddRandomStuff() {
        let rep = RandInt(GRID_ROWS*GRID_ROWS);
        for (let i = 0; i < rep; i++) {
            let rX = RandInt(GRID_ROWS);
            let rY = RandInt(GRID_ROWS);

            let pos = new Vector2(rX, rY);

            if (GetSprite(rX, rY).objectType != OBJECT_TYPE.Empty) continue;
            
            let item = RandInt(100);
            SwapSprite(pos, (item > 80) ? SPRITES.Cherry : SPRITES.Wall);
        }    
    }

    function CalculateTheDistance(x, y) {
        return Math.abs(x - player.position.y) + Math.abs(y - player.position.x)
    }

    function GetGridCell(x,y) {
        return document.querySelectorAll('.gridRow')[y].querySelectorAll('.gridCell')[x];
    }

    function RotateLevel(deg) {
        deg %= 360;
        let imgs  = document.querySelectorAll('.gridCell img');
        for(img of imgs) {
            img.style.transform = `rotate(${deg}deg)`; 
        }
    }

    function ScanGrid(x,y) {
        let freeSpace = [];

        
        let checkPositions = [
            [x, y-1],
            [x-1, y],
            [x+1,y],
            [x, y+1]
        ];
        
        for (let i = 0; i < checkPositions.length; i++) {
            let x = checkPositions[i][0];
            let y = checkPositions[i][1];
            if (checkForCollision(x,y)) {
                freeSpace.push([x,y]);
                // GetCurrentGridPosition(x,y).style['background'] = '#0f0';
            }
            
            // else GetCurrentGridPosition(x,y).style['background'] = '#f00';
        }

        return freeSpace;
    }

    function RandInt(max) {
        return Math.floor(Math.random()*max);
    }

    function SwapSprite(pos, sprite) {
        currentLevel[pos.y][pos.x] = sprite;
    }

    function GetSprite(x,y) {
        return currentLevel[y][x];
    }

    function GetGridPosition(cell) {
        return new Vector2(cell.getAttribute('x'),cell.getAttribute('y'));
    }

//#endregion

// Process all AI
let process = setInterval(ProcessAllEntities, 1000);

function CreateTileButton(sprite, name) {
    let tileButton = document.createElement('div');
    let img = document.createElement('img');
    let p = document.createElement('p');

    p.innerText = (name!='Guard') ? name : 'PLAYER';
    img.src = sprite.File;
    tileButton.setAttribute('tile', name);
    tileButton.classList.add('editBoxCell')
    tileButton.appendChild(img);
    tileButton.appendChild(p);
    return tileButton; 
}

function FillEditBox() {
    for (let key of Object.keys(SPRITES)) {
        let sprite = SPRITES[key];
        if (sprite === SPRITES.Empty) continue;
        let tileButton = CreateTileButton(sprite, key);
        
        tileButton.addEventListener('click', (e) => {
            let sprite = SPRITES[e.currentTarget.getAttribute('tile')];

            if(!editMode || selectedSprite === sprite) return;
            SOUNDS.Click.play();
            
            for (let cell of document.querySelectorAll('.editBoxCell')) {
                cell.classList.remove('selectedTile');
            }

            selectedSprite = sprite;
            e.currentTarget.classList.add('selectedTile');
        });

        editModeUI.appendChild(tileButton);
    }
    selectedSprite = SPRITES[Object.keys(SPRITES)[0]];
    document.querySelector('.editBoxCell').classList.add('selectedTile');
}

function CreateStaticScreen() {
    let staticScreenBox = document.createElement('div');
    let staticImg = document.createElement('img');
    staticImg.src = 'Sprites/static.gif';
    let p = document.createElement('p');
    p.innerText = 'INSERT COIN';

    let coinImg = document.createElement('img');
    coinImg.src = 'Sprites/Collectable/coin.png';
    coinImg.classList.add('coin');

    staticImg.classList.add('lightScreen');
    staticScreenBox.appendChild(p);
    staticScreenBox.appendChild(coinImg);

    staticScreenBox.classList.add('staticScreen');
    staticScreenBox.appendChild(staticImg);
    
    staticScreenBox.addEventListener('click', (e) => {
        UnBlurLevel();
        SOUNDS.Music.play();
        SOUNDS.Music.loop = true;   
        e.currentTarget.remove();
    });

    return staticScreenBox;
}

function UnBlurLevel() {
    for (let cell of document.querySelectorAll('.gridCell img')) {
        cell.classList.remove('bluredLevel');
    }
}

function ColorGrid() {
    let rows = document.querySelectorAll('div.gridRow');
    for (let row = 0; row < rows.length; row++) {
        let currentCell = 0;
        for (let cell of rows[row].querySelectorAll('div.gridCell')) {
            cell.style['background'] = checkPattern[row % 2][currentCell % 2];
            currentCell++;
        }
    }
}

function TurnEditMode() {
    if (SOUNDS.InvertedMusic.paused === false) {
        SOUNDS.InvertedMusic.pause();
        SOUNDS.Music.play();
        document.querySelectorAll('.gridCell').forEach((cell) => {
            cell.style.filter = 'none';
        });
    }
    
    SwapSprite(player.position, SPRITES.Empty);
    SwapSprite(player.spawnPosition, player.sprite);
    player.position = player.spawnPosition;

    currentLevel = tmpLevelData.slice();
    AI_ENTITIES.length = 0;
    RenderGrid();
}

function SpawnEntities() {
    for (let entity of document.querySelectorAll('.entity')) {
        AddEntity(ENTITIES[entity.getAttribute('entityData')],GetGridPosition(entity));
    }
    RenderGrid();
}

function TurnPlayMode() {
    tmpLevelData = currentLevel.slice();
    player.score = 0;
    SpawnEntities();
}

// Initialize Game 
InitGame();
FillEditBox();