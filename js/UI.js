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

function CreatePowerUpButton(powerup) {
    let powerUpButton = document.createElement('div');
    powerUpButton.classList.add('powerUpButton');
    powerUpButton.style.animation = 'popup 0.5s';

    let powerupImg = document.createElement('img');
    
    powerupImg.src = powerup.File;
    powerUpButton.appendChild(powerupImg);

    return powerUpButton;
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