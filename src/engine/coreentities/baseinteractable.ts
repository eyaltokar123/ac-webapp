import { BLEND_MODES, Container, IPointData, Sprite, Texture } from "pixi.js";
import { BaseEntity } from "./entity";
import { genHitmap } from "../../core/util";

export interface BaseInteractableAction {
    action: string,
    handler: Function,
}

export class BaseInteractable extends Sprite implements BaseEntity {
    public name: string;
    public actions: [BaseInteractableAction];
    public canInteract: boolean = true;
    public hoverHighlight = true;

    constructor(baseTexture?: Texture, name?: string, action?: BaseInteractableAction) {
        super(baseTexture);
        this.name = name ?? "";
        this.actions = [{action: "interact", handler: () => {console.log("hi")}}];
        if (action) {
            this.actions.push(action);
        }

        this.on("pointerdown", this.onPointerPress.bind(this));
        this.on("pointerup", this.onPointerRelease.bind(this));
        this.on("pointerupoutside", this.onPointerCancel.bind(this));
        this.on("pointercancel", this.onPointerCancel.bind(this));
        this.on("pointertap", this.onPointerClick.bind(this));

        this.on("pointerover", this.onPointerHover.bind(this));
        this.on("pointerout", this.onPointerHoverEnd.bind(this));

        this.eventMode = "dynamic";
    }

    onPointerPress(event: any) {

    }

    onPointerRelease(event: any) {
        if (!this.canInteract) {
            return;
        }

        const deleteActions = [];
        for (let i = 0; i < this.actions.length; i++) {
            const biAction = this.actions[i];
            if (biAction.action !== "interact") {
                continue;
            }

            if (biAction.handler) {
                biAction.handler(this);
            }
            else {
                deleteActions.push(i);
            }
        }

        for (let i = 0; i < deleteActions.length; i++) {
            this.actions.splice(deleteActions[i], 1);
        }
    }

    onPointerClick(event: any) {

    }

    onPointerCancel(event: any) {

    }

    onPointerHover(event: any) {
        if (this.hoverHighlight)
        {
            //Should probably save the state of the blendmode so we can revert back to it in case the blendmode was not normal.
            this.blendMode = BLEND_MODES.SCREEN;
        }
    }

    onPointerHoverEnd(event: any) {
        this.blendMode = BLEND_MODES.NORMAL;
    }

    containsPoint(point: IPointData): boolean {
        const tempPoint = { x: 0, y: 0 }
        //get mouse poisition relative to the anchor point
        this.worldTransform.applyInverse(point, tempPoint);
        // console.log('temppoint:' + tempPoint);

        const width = this._texture.orig.width;
        const height = this._texture.orig.height;
        const x1 = -width * this.anchor.x;
        let y1 = 0;

        let flag = false;
        //bounding box collision detection for sprite
        if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
            y1 = -height * this.anchor.y;

            if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
                flag = true;
            }
        }
        //if collision not detected return false
        if (!flag) {
            return false
        }

        // bitmap check
        const tex = this.texture;
        const baseTex = this.texture.baseTexture;
        const res = baseTex.resolution;

        if (!baseTex.hitmap) {
            //generate hitmap
            if (!genHitmap(baseTex, 255)) {
                return true;
            }

        }

        const hitmap = baseTex.hitmap;

        // console.log(hitmap)
        // this does not account for rotation yet

        //check mouse position if its over the sprite and visible
        let dx = Math.round((tempPoint.x - x1 + tex.frame.x) * res);
        let dy = Math.round((tempPoint.y - y1 + tex.frame.y) * res);
        // console.log(dx);
        // console.log(dy);
        let ind = (dx + dy * baseTex.realWidth);
        let ind1 = ind % 32;
        let ind2 = ind / 32 | 0;
        return (hitmap[ind2] & (1 << ind1)) !== 0;
    }
}