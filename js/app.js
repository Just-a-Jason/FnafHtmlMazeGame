//#region Map
    const EDITMODE_BUTTON = document.querySelector('.editModeButton');
    const EDITMODE_UI = document.querySelector('.editModeUI');
    let AI_ENTITIES = [];
    let checkPattern = [];
    let currentLevel = [];
    let lastHoveredSprite; 
    let editMode = true;
    let selectedSprite;
    let tmpLevelData;
    let aiProcessing; 
    let pointsText;
//#endregion
    
//#region Player Set Up
    const player = new Player(SPRITES.Guard, new Vector2(2,2));
    let crazyMode = false;
    let lastCellSprite;
    let FOV = 2;

    let playerDirections = {
        UP:-1,
        DOWN:1,
        LEFT:-1,
        RIGTH:1
    }

    function ControllPlayer(key) {
        let pos = new Vector2(player.position.x, player.position.y);
        
        switch (key) {
            // up
            case 'w': pos.y += playerDirections.UP; break;
            // down
            case 's': pos.y += playerDirections.DOWN; break;
            // left
            case 'a': pos.x += playerDirections.LEFT; break;
            // right
            case 'd': pos.x += playerDirections.RIGTH; break;
        }

        // can loop to left side of the level
        if (pos.x < 0) pos.x += GRID_ROWS;
        if (pos.y < 0) pos.y += GRID_ROWS;
        pos.x %= GRID_ROWS;
        pos.y %= GRID_ROWS;

        if (CheckForCollision(pos)) {
            if (lastCellSprite != undefined) SwapSprite(player.position, lastCellSprite);
            else SwapSprite(player.position, SPRITES.Empty);
    
            lastCellSprite = GetSprite(pos);
            player.position = pos;
            let sprite = GetSprite(pos);

            if (sprite.objectType === OBJECT_TYPE.PowerUp) {
                lastCellSprite = undefined;
                SwapSprite(player.position, player.sprite);
                RenderGrid();
                player.inventory.push(sprite.powerup);
                UpdatePlayerUI();
                return;
            }

            if (sprite.objectType === OBJECT_TYPE.Collectable) {
                SOUNDS.Collected.play();
                if (GetSprite(pos) === SPRITES.GoldenFreddy) {
                    SwapSprite(player.position, player.sprite);
                    TurnCrazyMode();

                    lastCellSprite = undefined;
                    SOUNDS.GfLaugh.play();
                    RenderGrid();
                    return;
                } 
                
                //can collect item
                lastCellSprite = undefined;
                player.score++;
                UpdatePointsText();
            }

            SwapSprite(player.position, player.sprite);
            RenderGrid();
        }
        RenderGrid();
}
//#endregion

//#region  Game Function 

    function Init() {
        document.addEventListener('keydown', (keyEvent) => {
            if (editMode) return; 
            ControllPlayer(keyEvent.key);
        });

        LoadLevel();
        BuildLevelGrid();
        CANVAS.appendChild(CreateStaticScreen());
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

                let pos = new Vector2(cell,row);
                let sprite = GetSprite(pos);
                let cellSprite = cells[cell].querySelector('img');
                let distance = CalculateTheDistance(row,cell);
                
                let cCell = cells[cell];
                if (distance > FOV && !editMode) {
                    cCell.style.opacity = '0';
                    cellSprite.style.opacity = '0';
                } else {
                    cellSprite.style.height = SINGLE_GRID_CELL_SIZE - sprite.Offset.y + "px";
                    cellSprite.style.width = SINGLE_GRID_CELL_SIZE - sprite.Offset.x + "px";
                    cellSprite.src = sprite.File;
                    cellSprite.style.opacity = '1';
                    cCell.style.opacity = '1';
                    if (!editMode && !crazyMode)
                    cCell.style.filter = 'brightness(1.5)';
                    if(!crazyMode) cCell.style.filter = 'none';
                    else cCell.style.filter = 'invert(1)';
                }
            }
        }
    }

    function LoadLevel() {
        currentLevel.length = 0;
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

    function CheckForCollision(pos) {
        return !GetSprite(pos).objectType == OBJECT_TYPE.Solid;
    }

    function ProcessAllEntities() {
        for (entity of AI_ENTITIES) {
            switch(entity.aiType) {
                case AI_TYPE.Chase:
                    Chase(entity);
                break;
                case AI_TYPE.Wander: 
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
        
        let pos = freeSpace[randomChoice];
        entity.overridedSprite = GetSprite(pos);
        
        // console.log(entity.overridedSprite);
        SwapSprite(pos, entity.sprite);
        
        if (entity.overridedSprite != entity.sprite && entity.overridedSprite != undefined) SwapSprite(entity.position, entity.overridedSprite);
        else SwapSprite(entity.position, SPRITES.Empty);
        
        SOUNDS.Movement.play();
        entity.position = pos;

        RenderGrid();
    }

    function AddRandomStuff() {
        let rep = RandInt(GRID_ROWS*GRID_ROWS);
        for (let i = 0; i < rep; i++) {
            let rX = RandInt(GRID_ROWS);
            let rY = RandInt(GRID_ROWS);

            let pos = new Vector2(rX, rY);

            if (GetSprite(pos).objectType != OBJECT_TYPE.Empty) continue;
            
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
            let pos = Vector2.ToVector2D(checkPositions[i]);
            
            if (pos.x < 0) pos.x += GRID_ROWS;
            if (pos.y < 0) pos.y += GRID_ROWS;
            pos.x %= GRID_ROWS;
            pos.y %= GRID_ROWS;

            if (CheckForCollision(pos)) {
                freeSpace.push(pos);
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

    function GetSprite(pos) {
        return currentLevel[pos.y][pos.x];
    }

    function GetGridPosition(cell) {
        return new Vector2(parseInt(cell.getAttribute('x')),parseInt(cell.getAttribute('y')));
    }

//#endregion

function CreateTileButton(sprite, name) {
    let tileButton = document.createElement('div');
    let img = document.createElement('img');
    let p = document.createElement('p');

    p.innerText = (name!='Guard') ? name : 'PLAYER';
    img.src = sprite.File;
    tileButton.setAttribute('tile', name);
    tileButton.classList.add('editBoxCell');
    tileButton.appendChild(img);
    tileButton.appendChild(p);
    return tileButton; 
}

function FillEditBox() {
    let editModeBtn = document.createElement('div');
    editModeBtn.classList.add('editModeButton');
    let p = document.createElement('p');
    p.innerText = 'PLAY MODE';
    editModeBtn.appendChild(p);
    editModeBtn.addEventListener('click', (e) => {
            editMode = !editMode;
            if (editMode) {RotateLevel(0);TurnEditMode();}
            else TurnPlayMode();
            e.currentTarget.innerText =  (editMode) ? 'PLAY MODE' : 'EDIT MODE';
            EDITMODE_UI.style.opacity = !(editMode) ? '0.5' : '1';
            RenderGrid();
    });

    editModeUI.appendChild(editModeBtn);
    
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
        FillEditBox();
        CreateUI();
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
    clearInterval(aiProcessing);
    if (crazyMode) {
        crazyMode = false;
        InvertPlayerControlls();
        SOUNDS.InvertedMusic.pause();
        SOUNDS.Music.play();
        document.querySelectorAll('.gridCell').forEach((cell) => {
            cell.style.filter = 'none';
        });
    }
    
    SwapSprite(player.position, SPRITES.Empty);
    SwapSprite(player.spawnPosition, player.sprite);
    player.position = player.spawnPosition;
    player.score = 0;
    
    AI_ENTITIES.length = 0;
    player.inventory = [];
    RenderGrid();
    LoadLevelData();
    UpdatePointsText();
}

function SpawnEntities() {
    document.querySelectorAll('.entity').forEach((entity) => {
        let key = entity.getAttribute('entitydata');
        let pos = GetGridPosition(entity);
        AddEntity(ENTITIES[key], pos);
    });
    aiProcessing = setInterval(ProcessAllEntities, 1000);
    RenderGrid();
}

function TurnPlayMode() {
    CopyLevelData();
    player.score = 0;
    SpawnEntities();
}

function CopyLevelData() {
    tmpLevelData = [];
    for (let i = 0; i < currentLevel.length; i++) {
        let row = [];
        for (let j = 0; j < currentLevel[i].length; j++) {
          row.push(currentLevel[i][j]);
        }
        tmpLevelData.push(row);
    }
}

function LoadLevelData() {
    currentLevel.length = 0;
    for (let i = 0; i < tmpLevelData.length; i++) {
        let row = [];
        for (let j = 0; j < tmpLevelData[i].length; j++) {
          row.push(tmpLevelData[i][j]);
        }
        currentLevel.push(row);
    }
    tmpLevelData = undefined;
}

function TurnCrazyMode() {
    crazyMode = true;
    RotateLevel(180); 
    SOUNDS.Music.pause();
    SOUNDS.InvertedMusic.play();
    SOUNDS.InvertedMusic.loop = true;
    InvertPlayerControlls();
}

function InvertPlayerControlls() {
    // Invert player keys
    for (let key of Object.keys(playerDirections)) playerDirections[key]*=-1;
}

function UpdatePointsText() {
    let z = 5 - String(player.score).length;
    let playerPointsText = '';
    for (let i = 0; i < z; i++) {
    playerPointsText += '0';
    }
    pointsText.classList.remove('flipText');
    playerPointsText += `${player.score} pts`;
    pointsText.innerText = playerPointsText;
    void pointsText.offsetWidth;
    pointsText.classList.add('flipText');
}

function BuildLevelGrid() {
    // we have a grid
    if (document.querySelector('.gameWindow') != undefined) {
        document.querySelector('.gameWindow').remove();
    }
    let gameWindow = document.createElement('div');
    gameWindow.classList.add('gameWindow');

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

            // Map Editor Logic
            gridCell.addEventListener('click', (e) => {
                if (!editMode) return;
                let clickPos = GetGridPosition(e.currentTarget);

                // cannot place on player position
                if (GetSprite(clickPos) === player.sprite && selectedSprite != player.sprite) return;

                if (GetSprite(clickPos) === selectedSprite) {
                    if (selectedSprite.tag === TAGS.Player) return;
                    let cell = GetGridCell(clickPos.x, clickPos.y);
                    cell.classList.remove('entity');
                    cell.removeAttribute('entityData');
                    SwapSprite(clickPos, SPRITES.Empty);
                    lastHoveredSprite = SPRITES.Empty.File;
                    RenderGrid();
                    return; 
                }
                else { SwapSprite(clickPos, selectedSprite); lastHoveredSprite = selectedSprite.File; };
                
                if (selectedSprite.tag === TAGS.Player) {
                    SwapSprite(player.position, SPRITES.Empty);
                    player.position = clickPos;
                    console.log(clickPos);
                    player.spawnPosition = clickPos;
                    console.log(player.position);
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

            gridCell.addEventListener('mouseenter', (e) => { 
                if(!editMode || selectedSprite == undefined) return; 
                let sprite = e.currentTarget.childNodes[0];
                e.currentTarget.classList.add('selectedGridCell');
                lastHoveredSprite = sprite.src;
                sprite.src = selectedSprite.File;
                sprite.style.opacity = '0.5';
            });
            
            gridCell.addEventListener('mouseleave', (e) => { 
                if(!editMode || selectedSprite == undefined) return;
                e.currentTarget.classList.remove('selectedGridCell');
                let sprite = e.currentTarget.childNodes[0];
                sprite.src = lastHoveredSprite;
                sprite.style.opacity = '1';
            });

            gridRow.appendChild(gridCell);
        }
        canvas.appendChild(gridRow);
    }

    gameWindow.appendChild(canvas);
    CANVAS.appendChild(gameWindow);
    
    checkPattern.length = 0;
    // currentLevel.length = 0;
    for (let i = 0; i < GRID_ROWS; i++) {
        checkPattern.push(i % 2 === 0 ? ['#000', '#222'] : ['#222', '#000']);
    }

    AddRandomStuff();
    ColorGrid();
    RenderGrid();
}

function CreatePowerUpButton(powerup) {
    let powerUpButton = document.createElement('div');
    powerUpButton.classList.add('powerUpButton');
    powerUpButton.style.animation = 'popup 0.5s';

    let powerupImg = document.createElement('img');
    
    powerupImg.src = powerup.File;
    powerUpButton.appendChild(powerupImg);

    return powerUpButton;
}

function CreateUI() {
    let userInterface = document.createElement('div');
    userInterface.classList.add('flexrow'); 

    let ptsText = document.createElement('p');
    ptsText.innerText = '00000 pts';
    ptsText.style.width = '50%';

    let powerUpUI = document.createElement('div');
    for (let i = 0; i < 6; i++) powerUpUI.appendChild(CreatePowerUpButton(SPRITES.Empty));
    powerUpUI.style.width = '50%';
    powerUpUI.classList.add('flexrow');
    powerUpUI.style.justifyContent = 'left';  
    powerUpUI.classList.add('powerUpUI');

    userInterface.appendChild(powerUpUI);
    userInterface.appendChild(ptsText);
    userInterface.classList.add('userInterface');
    pointsText = ptsText;
    document.querySelector('.gameWindow').appendChild(userInterface);
}

function UpdatePlayerUI() {
    let playerUISlots = document.querySelectorAll('.powerUpButton');
    for (let i = 0; i < player.inventory.length; i++) {
        let powerUpSlot;
        if (playerUISlots[i] == undefined) {powerUpSlot = CreatePowerUpButton(SPRITES.FlashLight); document.querySelector('.powerUpUI').appendChild(powerUpSlot);}
        else powerUpSlot = playerUISlots[i];

        powerUpSlot.childNodes[0].src = SPRITES.FlashLight.File;
        powerUpSlot.setAttribute('powerUP', player.inventory[i]);
        powerUpSlot.style.animation = 'Grow 0.5s'; 
    }
}

// Initialize Game 
Init();
pointsText = document.querySelector('.gameWindow p');
