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
    let itemSlot = document.querySelectorAll('.powerUpButton')[0]; 
    itemSlot.classList.remove('inventorySlotJump');
    void itemSlot.offsetWidth;
    itemSlot.classList.add('inventorySlotJump');
}

function CreatePowerUpButton(powerup) {
    let powerUpButton = document.createElement('div');
    powerUpButton.classList.add('powerUpButton');

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

    p.innerText =  name;
    img.src = sprite.File;
    tileButton.setAttribute('tile', name);
    tileButton.classList.add('editBoxCell');
    tileButton.appendChild(img);
    tileButton.appendChild(p);
    return tileButton; 
}

function FillEditBox() {
    CreateCategories();
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
        
        let categoryList = document.querySelector(`#category-${GetCategoryKey(sprite.category)}`);
        categoryList.appendChild(tileButton);
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
        ShowCategory('Obstacles');
        ShowElement(EDITMODE_UI);
        ShowElement(DIALOGBOX_HOLDER);
    });
    
    return staticScreenBox;
}

function CreateDialogBox(sprite, text, color, shadow=false) {
    if (DIALOGBOX_HOLDER.childElementCount > 8) DIALOGBOX_HOLDER.removeChild(DIALOGBOX_HOLDER.childNodes[8]);
    let dialogBox = document.createElement('div');
    dialogBox.classList.add('dialogBox');
    
    let dialogBoxImg = document.createElement('img');
    dialogBoxImg.src = sprite.File;
    
    let p = document.createElement('p');
    p.innerText = text;
    dialogBox.appendChild(dialogBoxImg);
    dialogBox.appendChild(p);
    if (color != undefined)  {p.style.color = color; if(shadow) p.style.filter = `drop-shadow(2px 4px 3px ${color})`; };

    return dialogBox;
}

function PushDialogBox(sprite, text, color, shadow, audioFile) {
    if (audioFile != undefined) audioFile.play();
    DIALOGBOX_HOLDER.insertBefore(CreateDialogBox(sprite,text, color, shadow), DIALOGBOX_HOLDER.firstChild);
}

function CreateCategoryButton(category) {
    let CategoryBtn = document.createElement('div');
    CategoryBtn.classList.add('categoryBtn');
    
    let p = document.createElement('p');
    p.innerText = category;
    CategoryBtn.appendChild(p);

    CategoryBtn.setAttribute('onclick', `ShowCategory('${category}')`);
    
    EDITMODE_TILES_LIST.appendChild(CategoryBtn);
    
    let categoryList = document.createElement('div');
    categoryList.id = `category-${category}`;
    categoryList.classList.add('categoryList');
    EDITMODE_TILES_LIST.appendChild(categoryList);    

}

function CreateCategories() {
    Object.keys(CATEGORIES).forEach((category) => {
        CreateCategoryButton(category);
    });
}

function ShowCategory(category) {
    document.querySelectorAll('.categoryList').forEach((category) => {
        category.classList.remove('categoryListActive');
    });

    document.querySelector(`#category-${category}`).classList.add('categoryListActive');
}
