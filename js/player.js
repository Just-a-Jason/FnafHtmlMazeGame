const player = new Player(SPRITES.Guard, new Vector2(2,2));
let crazyMode = false;
let lastCellSprite;
let FOV = 3;

let playerDirections = {UP:-1, DOWN:1, LEFT:-1, RIGTH:1};

function ControllPlayer(key) {
    let pos = new Vector2(player.position.x, player.position.y);
        
    switch (key) {
        case 'w': pos.y += playerDirections.UP; break;
        case 's': pos.y += playerDirections.DOWN; break;
        case 'a': pos.x += playerDirections.LEFT; break;
        case 'd': pos.x += playerDirections.RIGTH; break;
    }

    ClampPosition(pos);

    if (CheckForCollision(pos)) {
        if (lastCellSprite != undefined) SwapSprite(player.position, lastCellSprite);
        else SwapSprite(player.position, SPRITES.Empty);
    
        lastCellSprite = GetSprite(pos);
        player.position = pos;
        let sprite = GetSprite(pos);

        if (sprite.objectType === OBJECT_TYPE.Collectable) {
            SOUNDS.Collected.play();
            if(GetSprite(pos).category === CATEGORIES.Powerups) {
                // full inventory
                if (player.inventory.length == 6) {lastCellSprite = GetSprite(pos); SwapSprite(player.position, player.sprite); RenderGrid(); return};
                player.inventory.push(GetSprite(pos));
                SwapSprite(player.position, player.sprite);
                lastCellSprite = undefined;
                UpdatePlayerUI();
                RenderGrid();
                return;
            }

            if (GetSprite(pos) === SPRITES["Golden Freddy"]) {
                AI_ENTITIES.splice(AI_ENTITIES.indexOf(SPRITES["Golden Freddy"]),1);
                SwapSprite(player.position, player.sprite);
                TurnCrazyMode();

                lastCellSprite = undefined;
                SOUNDS.GfLaugh.play();
                RenderGrid();
                return;
            } 
                
            lastCellSprite = undefined;
            player.score++;
            UpdatePointsText();
        }

        SwapSprite(player.position, player.sprite);
        RenderGrid();
    }
    RenderGrid();
}