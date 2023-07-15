function GetEntityKey() {
    for (let key of Object.keys(ENTITIES)) {
        if (ENTITIES[key].sprite === selectedSprite)
            return key;
    }
}

function CheckForCollision(pos) {
    return !GetSprite(pos).objectType == OBJECT_TYPE.Solid;
}

function ClampPosition(pos) {
    if (pos.x < 0) pos.x += GRID_ROWS;
    if (pos.y < 0) pos.y += GRID_ROWS;
    pos.x %= GRID_ROWS;
    pos.y %= GRID_ROWS;
}

function ScanGrid(x,y,areaSize) {
    let freeSpace = [];
    
    let checkPositions = [[x, y-1],[x-1, y],[x+1,y],[x, y+1]];
    
    for (let i = 0; i < checkPositions.length; i++) {
        let pos = Vector2.ToVector2D(checkPositions[i]);
        
        ClampPosition(pos);

        if (CheckForCollision(pos)) freeSpace.push(pos);
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

function RotateLevel(deg) {
    document.querySelectorAll('.gridCell img').forEach((img)=>img.style.transform = `rotate(${deg}deg)`);
}

function GetGridCell(x,y) {
    return document.querySelectorAll('.gridRow')[y].querySelectorAll('.gridCell')[x];
}

function CalculateTheDistance(x, y) {
    return Math.abs(x - player.position.y) + Math.abs(y - player.position.x)
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

function CheckForEntityInGrid(entityType) {
    for (let entity of document.querySelectorAll('.entity'))
        if (entity.getAttribute('entityData') === entityType) return [true, GetGridPosition(entity)];
    return [false,undefined];
}

function InvertPlayerControlls() {
    for (let key of Object.keys(playerDirections)) playerDirections[key]*=-1;
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

function TurnPlayMode() {
    CopyLevelData();
    player.score = 0;
    SpawnEntities();
}