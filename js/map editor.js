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

function CreateRandomLevel() {
    currentLevel.length = 0;
    AddFullRow();
    for (let i = 0; i < GRID_ROWS-2; i++) {
        AddBoxedCollumn();
    }
    AddFullRow();
    SwapSprite(player.position, player.sprite);
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
    CANVAS.insertBefore(gameWindow, CANVAS.childNodes[2]);
    
    checkPattern.length = 0;
    for (let i = 0; i < GRID_ROWS; i++) {
        checkPattern.push(i % 2 === 0 ? ['#000', '#222'] : ['#222', '#000']);
    }

    AddRandomStuff();
    ColorGrid();
    RenderGrid();
}