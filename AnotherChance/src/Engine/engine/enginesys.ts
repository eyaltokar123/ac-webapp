import { randomUUID } from "../core/util";
import { Serialisation } from "../core";
import TweenShape from "../framework/animations/tween/models";
import { createEventBus } from "../framework/events";
import { IRenderableResource } from "../framework/graphics";
import { BaseGame } from "../gameplay/game";
import { AssetSystem } from "./assetloader";
import { BaseInteractable, BaseInteractableAction } from "./coreentities";
import { Location } from "./coreentities/location";
import { HudSystem } from "./gui";
import { InputSystem } from "./input";
import { RenderSystem } from "./render/rendersys";
import { AnimationSystem, createNamedAnimate, PremadeAnimations } from "./rendereffects";
import { Scene, SceneSystem } from "./scene";
import { Sprite, Ticker, utils } from "pixi.js";
import { EntitySystem } from "./engineents";
import { HoverableSprite } from "./gui/models/HoverableSprite.ts";
import { NamedSprite } from "./coreentities/NamedSprite.ts";

let DEBUG = true;

export type IEngineEvent = {
    eventId: string;
    event: Symbol;
}

export function createEngineEvent(event: Symbol, eventData: Object): IEngineEvent {
    /* eventData["eventId"] = crypto.randomUUID();
    eventData["event"] = event; */
    return {event, eventId: randomUUID(), ...eventData} as IEngineEvent;
}

interface EngineSave {
    game: Object;
    ent: Object;
    animation: Object;
    scene: Object;
    hud: Object;
    render: Object;
}

export interface RestoreState {
    loadState?(data: Object): void;
}

export interface EngineSystem extends RestoreState {
    queue(engineEvent: IEngineEvent): void;
    update(time: number): void;
}

export const EngineBus = createEventBus<IEngineEvent>();

export class Engine {
    static Render: EngineSystem;
    static Animation: EngineSystem;
    static Scene: EngineSystem;
    static Input: EngineSystem;
    static Assets: EngineSystem;
    static Game: EngineSystem;
    static Hud: EngineSystem;
    static Ent: EngineSystem;

    static ticker: Ticker;

    static defaultConfig = {
        render: {
            renderer: {
                width: 1920,
                height: 1080,
                resolution: 1,
                gpu: true,
                mobile: utils.isMobile.any,
            },
        }
    };

    static init(game?: EngineSystem) {
        Engine.ticker = Ticker.shared;
        Engine.ticker.stop();
        Engine.ticker.autoStart = false;

        Engine.Render = new RenderSystem(Engine.defaultConfig);
        Engine.Animation = new AnimationSystem();
        Engine.Scene = SceneSystem.getInstance();
        Engine.Input = new InputSystem();
        Engine.Assets = AssetSystem.getInstance();
        Engine.Hud = new HudSystem();
        Engine.Ent = new EntitySystem();

        if (game) {
            Engine.Game = game;
        }
        Engine.createPremades();
        getEngine().getAnimation().subscribeToAnimationEvents(getEngine().getScene());
        Engine.loop(performance.now());
    }

    static setGame(game: EngineSystem) {
        Engine.Game = game;
    }

    static createPremades() {
        const ease = new TweenShape(0, 0.33, 0.67, 1);
        createNamedAnimate(PremadeAnimations.FADE_OUT, "alpha", false, 0, ease);
        createNamedAnimate(PremadeAnimations.FADE_IN, "alpha", false, 1, ease);
    }

    static loop(dt: DOMHighResTimeStamp) {
        Engine.ticker.update(dt);

        Engine.Input.update(dt);
        Engine.Ent.update(dt);
        Engine.Scene.update(dt);
        Engine.Animation.update(dt);
        Engine.Render.update(dt);
        Engine.Hud.update(dt);

        if (Engine.Game) {
            Engine.Game.update(dt);
        }
        requestAnimationFrame(Engine.loop);
    }

    static async createSimpleIntractable(name: string, action: BaseInteractableAction, texture: IRenderableResource) {
        const asset = await getEngine().getAssets().loadTexture(texture);
        return new BaseInteractable(asset?.texture, name, action);
    }

    static async createSceneItem(name: string, texture: IRenderableResource, action?: BaseInteractableAction) {
        const asset = await getEngine().getAssets().loadTexture(texture);
        if (!action) {
            return new NamedSprite(asset?.texture, name);
        }
        return new BaseInteractable(asset?.texture, name, action);
    }


    static async createSimpleSceneIntractable(name: string, action: BaseInteractableAction, texture: IRenderableResource, attach?: Scene) {
        const intractable = await Engine.createSimpleIntractable(name, action, texture);
        if (attach) {
            attach.addSceneObject(intractable);
        }
        return intractable;
    }

    static async createSimpleSprite(texture: IRenderableResource) {
        const asset = await getEngine().getAssets().loadTexture(texture);
        if (asset) {
            return Sprite.from(asset.texture);
        }
    }

    static async createHoverAbleSprite(texture: IRenderableResource) {
        const asset = await getEngine().getAssets().loadTexture(texture);
        if (asset) {
            return HoverableSprite.from(asset.texture);
        }
    }

    static screenPositionByRatio(xRatio: number, yRatio: number) {
       return getEngine().getRender().screenPositionByRatio(xRatio, yRatio);
    }

    static resolve(resolvable: string) {
        const parts = resolvable.split(":");
        if (parts.length === 0) {
            return;
        }

        switch(parts[0]) {
            case "HUD": {
                return (Engine.Hud as HudSystem).activeElements().find(e => e.name === parts[1]);
            }
            case "ENTITY": {
                return (Engine.Ent as EntitySystem).findEntityByName(parts[1]);
            }
            case "LOCATION": {
                return (Engine.Scene as SceneSystem).sceneByName(parts[1]) as Location;
            }
        }
    }

    static save() {
        const serial = new Serialisation.Serialise();
        const save = serial.serialise({
            game: Engine.Game,
            ent: Engine.Ent,
            animation: Engine.Animation,
            scene: Engine.Scene,
            hud: Engine.Hud,
        });
        console.log(save);
        return save;
    }

    static load(data: string) {
        const deserial = new Serialisation.Deserialise();
        const save = deserial.deserialise(data) as EngineSave;
        if (!save) {
            console.error(`${data} could not be deserialised or is empty.`);
            return;
        }

        if (save.game) {
            Engine.Game.loadState?.(save.game);
        }

        if (save.ent) {
            Engine.Ent.loadState?.(save.ent);
        }

        if (save.animation) {
            Engine.Animation.loadState?.(save.animation);
        }

        if (save.scene) {
            Engine.Scene.loadState?.(save.scene);
        }

        if (save.hud) {
            Engine.Hud.loadState?.(save.hud);
        }

        console.log(save);
    }
}

export function getEngine() {
    return {
        DEBUG,
        getRender: () => Engine.Render as RenderSystem,
        getAssets: () => Engine.Assets as AssetSystem,
        getAnimation: () => Engine.Animation as AnimationSystem,
        getScene: () => Engine.Scene as SceneSystem,
        getGame: () => Engine.Game as BaseGame,
        getHud: () => Engine.Hud as HudSystem,
        getEnt: () => Engine.Ent as EntitySystem,
        createSimpleIntractable: Engine.createSimpleIntractable,
        createSimpleSceneIntractable: Engine.createSimpleSceneIntractable,
        createSimpleSprite: Engine.createSimpleSprite,
        createSceneItem: Engine.createSceneItem,
        createHoverAbleSprite: Engine.createHoverAbleSprite,
        SPR: Engine.screenPositionByRatio,
        resolve: Engine.resolve,
        save: Engine.save,
        load: Engine.load,
    };
}
