export class Field {
    constructor(colNo, rowNo, gameConfig) {
        this.colNo = colNo;
        this.rowNo = rowNo;
        if (
            colNo < 0 ||
            rowNo < 0 ||
            colNo > gameConfig.fieldSize - 1 ||
            rowNo > gameConfig.fieldSize - 1
        ) {
            throw new InvalidFieldPosition(this);
        }
        this.isUnveiled = false;
        this.isFlagged = false;
    }

    renderOnField(renderer, hitBox) {
        this.hitBox = hitBox;
        renderer.render(this.getState());
    }

    getState() {
        if (this.isUnveiled) {
            return FieldState.Unveiled;
        }
        return this.isFlagged ? FieldState.Flagged : FieldState.Hidden;
    }

    checkForHit(hit, flagging) {
        if (this.hitBox.isHit(hit)) {
            if (flagging) {
                this.isFlagged = !this.isFlagged;
            } else {
                this.isUnveiled = true;
            }
            return true;
        }
        return false;
    }

    get flagged() {
        return this.isFlagged;
    }
}