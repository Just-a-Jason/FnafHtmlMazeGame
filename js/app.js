function Init() {
    document.addEventListener('keydown', (keyEvent) => {
            if (editMode) return; 
            ControllPlayer(keyEvent.key);
    });

    CreateRandomLevel();
    BuildLevelGrid();
    CANVAS.appendChild(CreateStaticScreen());
        
    EDITMODE_BUTTON.addEventListener('click', (e) => {
        editMode = !editMode;
        if (editMode) {RotateLevel(0);TurnEditMode();}
        else TurnPlayMode();
        e.currentTarget.innerText =  (editMode) ? 'PLAY MODE' : 'EDIT MODE';
        EDITMODE_UI.style.opacity = !(editMode) ? '0.5' : '1';
        RenderGrid();
    });
        
    HideElement(EDITMODE_UI);
    HideElement(DIALOGBOX_HOLDER);
}

// Initialize Game 
Init();