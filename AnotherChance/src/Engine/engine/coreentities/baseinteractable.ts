import { BLEND_MODES, IPointData, Texture } from "pixi.js";
import { RenderableEntity } from "./entity";
import { genHitmap, onSceneOutChildren } from "../../core/util";
import { Popup } from "../gui";
import { Scene } from "../scene";

export interface BaseInteractableAction {
    action: string,
    handler: Function | undefined,
}

export class BaseInteractable extends RenderableEntity {
    public actions: [BaseInteractableAction];
    public canInteract: boolean = true;
    public hoverHighlight = true;
    public hoverLabel = true;
    private label?: Popup;

    constructor(baseTexture: Texture, name: string, action: BaseInteractableAction) {
        super(baseTexture, name);
        this.actions = [action] || [{
            action: "interact",
            handler: () => {
                console.log(`HI HI, interact with ${ name }`)
            }
        }];
        if (action) {
            this.actions.push(action);
        }

        this.eventMode = "dynamic";
    }

    addAction(action: BaseInteractableAction) {
        this.actions.push(action);
    }

    invokeAction(action: string) {
        const deleteActions = [];
        for (let i = 0; i < this.actions.length; i++) {
            const biAction = this.actions[i];
            if (biAction.action !== action) {
                continue;
            }

            if (biAction.handler) {
                biAction.handler(this);
            } else {
                deleteActions.push(i);
            }
        }

        for (let i = 0; i < deleteActions.length; i++) {
            this.actions.splice(deleteActions[i], 1);
        }
    }

    onSceneOut(scene: Scene): void {
        this.onPointerHoverEnd(undefined);
        this.eventMode = "none";
        onSceneOutChildren(this.children, scene);
    }

    // @ts-ignore
    onPointerPress(event: any) {

    }

    // @ts-ignore
    onPointerRelease(event: any) {
        if (!this.canInteract) {
            return;
        }

        this.invokeAction("interact");
    }

    // @ts-ignore
    onPointerClick(event: any) {

    }

    // @ts-ignore
    onPointerCancel(event: any) {

    }

    // @ts-ignore
    onPointerHover(event: any) {
        if (this.hoverHighlight) {
            //Should probably save the state of the blendmode so we can revert back to it in case the blendmode was not normal.
            this.blendMode = BLEND_MODES.SCREEN;
        }

        if (this.hoverLabel && this.label) {
            this.label.show();
        }
    }

    // @ts-ignore
    onPointerHoverEnd(event: any) {
        this.blendMode = BLEND_MODES.NORMAL;
        if (this.label) {
            this.label.hide();
        }
    }

    setLabel(label: Popup) {
        this.label = label;
        let labelX = 0;
        let labelY = 0;
        this.label.position.set(labelX, labelY);
        this.addChild(label);
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

        // @ts-ignore
        if (!baseTex.hitmap) {
            //generate hitmap
            if (!genHitmap(baseTex, 255)) {
                return true;
            }

        }

        // @ts-ignore
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
