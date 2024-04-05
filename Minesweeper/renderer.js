import {FieldState, Mine} from "./fields.js";

export class Renderer {
    constructor(ctx, gameConfig, fieldPixelSize, fields) {
        this.ctx = ctx;
        this.gameConfig = gameConfig;
        this.fieldPixelSize = fieldPixelSize;
        this.fields = fields;
    }

    render() {
        this.renderFields();
        this.drawGrid();
    }

    renderFields() {
        const singleFieldPixel = this.fieldPixelSize / this.gameConfig.fieldSize;
        const translateFieldPos = f => {
            const leftUpperX = f.colNo * singleFieldPixel;
            const leftUpperY = f.rowNo * singleFieldPixel;
            const rightLowerX = leftUpperX + singleFieldPixel;
            const rightLowerY = leftUpperY + singleFieldPixel;
            return [
                new Position(leftUpperX, leftUpperY),
                new Position(rightLowerX, rightLowerY)
            ];
        }

        for (let fRow of this.fields) {
            for (let field of fRow) {
                const [leftUpper, rightLower] = translateFieldPos(field);
                const fRenderer = new FieldRenderer(c => {
                    this.drawRect(leftUpper, rightLower, c)
                });
                field.renderOnField(fRenderer, new Hitbox(leftUpper, rightLower));
            }
        }
    }

    drawGrid() {
        const drawLineAndShift = (start, end, shiftFunc) =>
        {
            this.drawLine(start, end);
            start = shiftFunc(start, gap);
            end = shiftFunc(end, gap);
            return [start, end];
        }

        const gap = this.fieldPixelSize / this.gameConfig.fieldSize;
        const origin = new Position(0, 0);
        let start = origin;
        let end = start.moveY(this.fieldPixelSize);
        for (let i = 0; i <= this.gameConfig.fieldSize; i++) {
            [start, end] = drawLineAndShift(start, end,
                (position) => {
                return position.moveX(gap)
            });
        }
        start = origin;
        end = start.moveX(this.fieldPixelSize);
        for (let i = 0; i <= this.gameConfig.fieldSize; i++) {
            [start, end] = drawLineAndShift(start, end,
                (position) => {
                return position.moveY(gap)
            });
        }


    }

    MinesAround(leftUpper, rightLower) {
        let minesCount = 1;

        for(let i = Math.max(leftUpper.y - 1, 0); i <= Math.min(rightLower.y + 1, this.gameConfig.fieldSize - 1); i++) {
            for(let j = Math.max(leftUpper.x - 1, 0); j < Math.min(rightLower.x + 1, this.gameConfig.fieldSize - 1); j++)
            {
                if(this.fields[i][j] instanceof Mine)
                {
                    minesCount++;
                }
            }
        }

        return minesCount;
    }



    drawLine(startPos, endPos) {
        this.ctx.beginPath();
        this.ctx.moveTo(startPos.x, startPos.y);
        this.ctx.lineTo(endPos.x, endPos.y);
        this.ctx.stroke();
    }

    drawRect(leftUpper, rightLower, color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(
            leftUpper.x,
            leftUpper.y,
            leftUpper.horizontalDistanceTo(rightLower),
            leftUpper.verticalDistanceTo(rightLower)
        );
        this.ctx.fill();

        if(color === 'white') {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.MinesAround(leftUpper,rightLower), (leftUpper.x + rightLower.x) / 2, (leftUpper.y + rightLower.y) / 2);
        }


    }
}



export class FieldRenderer {
    constructor(draw) {
        this.draw = draw;
    }

    render(state) {
        let color = null;
        switch (state) {
            case FieldState.Hidden:
            {
                color = 'grey';
                break;
            }
            case FieldState.Unveiled:
            {
                color = 'white';
                break;
            }
            case FieldState.Flagged:
            {
                color = 'blue';
                break;
            }
            case FieldState.Detonated:
            {
                color = 'red';
                break;
            }
            default: {
                throw new UnknownFieldState(state);
            }
        }
        this.draw(color);
    }
}

export class Hitbox {
    constructor(leftUpper, rightLower) {
        this.leftUpper = leftUpper;
        this.rightLower = rightLower;
    }

    isHit(hit) {
        return (
            hit.x >= this.leftUpper.x &&
            hit.x <= this.rightLower.x &&
            hit.y >= this.leftUpper.y &&
            hit.y <= this.rightLower.y
        );
    }
}

export class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    moveX(pixel) {
        return new Position(this.x + pixel, this.y);
    }

    moveY(pixel) {
        return new Position(this.x, this.y + pixel);
    }

    horizontalDistanceTo(other) {
        const distance = this.x - other.x;
        return Math.abs(distance);
    }

    verticalDistanceTo(other) {
        const distance = this.y - other.y;
        return Math.abs(distance);
    }
}