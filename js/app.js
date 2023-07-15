function Init() {
        document.addEventListener('keydown', (keyEvent) => {
            if (editMode) return; 
            ControllPlayer(keyEvent.key);
        });

        CreateRandomLevel();
        BuildLevelGrid();
        CANVAS.appendChild(CreateStaticScreen());
}

// Initialize Game 
Init();