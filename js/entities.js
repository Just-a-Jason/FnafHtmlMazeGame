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

function Wander(entity) {  
    let scanMode = (entity.sprite === SPRITES["William Afton"]) ? GRID_SCAN_MODE.Full : GRID_SCAN_MODE.Cross;
    let freeSpace = ScanGrid(entity.position,scanMode);
    
    if (freeSpace.length == 0) return;
    
    let randomChoice = RandInt(freeSpace.length);
    
    let pos = freeSpace[randomChoice];
    
    entity.overridedSprite = GetSprite(pos);
    
    SwapSprite(pos, entity.sprite);
    UpdateTile(pos);
    
    if (entity.overridedSprite != entity.sprite && entity.overridedSprite != undefined) SwapSprite(entity.position, entity.overridedSprite);
    else SwapSprite(entity.position, SPRITES.Empty);
    UpdateTile(entity.position);   
    
    SOUNDS.Movement.play();
    entity.position = pos;
    
    UpdateTile(pos);
}

function Chase(entity) {
}

function Teleport(entity) {
    SwapSprite(entity.position, SPRITES.Empty);
    UpdateTile(entity.position);
    let freeSpace = ScanGrid(player.position, GRID_SCAN_MODE.Full);
    let pos = freeSpace[RandInt(freeSpace.length)];
    entity.position = pos;
    SwapSprite(pos, entity.sprite);

    UpdateTile(pos);
}

function ProcessAllEntities() {
    AI_ENTITIES.forEach(entity => {
        switch(entity.aiType) {
            case AI_TYPE.Chase:
                Chase(entity);
            break;
            case AI_TYPE.Wander: 
                Wander(entity);
            break;
            case AI_TYPE.Teleport:
                Teleport(entity);
            break;
        }   
    });
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

function TurnCrazyMode() {
    crazyMode = true;
    RotateLevel(180); 
    SOUNDS.Music.pause();
    SOUNDS.InvertedMusic.play();
    SOUNDS.InvertedMusic.loop = true;
    InvertPlayerControlls();
}
