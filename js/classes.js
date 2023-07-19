class ObjectType {
    constructor(type) {
        this.type = type;
    }
};

class Entity {
    constructor(sprite, aiType, dialogues) {
        this.position = new Vector2(0,0),
        this.overridedSprite = undefined;
        this.dialogues = dialogues;
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
        this.inventory = [];
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
    constructor(file, offset, objectType, category, tag) {
        this.objectType = objectType;
        this.category = category;
        this.Offset = offset;
        this.File = file;
        this.tag = tag;
    }
};

class Dialog {
    constructor(text, audioFile, color='#fff', hasShadow=true) {
        this.hasShadow = hasShadow;
        this.audioFile = audioFile;
        this.color = color;
        this.text = text;
    }
}