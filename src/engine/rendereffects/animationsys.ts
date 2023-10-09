import { Container } from "pixi.js";
import { EngineSystem, EngineBus, createEngineEvent } from "../enginesys";
import { Render_Animate, Render_Animation_Finish, Render_Clear_Animate } from "./models/events";
import { vec3 } from "../../core/math/models";
import TweenShape from "../../framework/animations/tween/models/tweenshape";
import { Animation } from "./models/animation";
import { Animate } from "./models/animate";
import { RenderEffectFlags, RenderEffectProps } from "./models/renderop";
import { Tween, TweenPosition } from "../../framework/animations/tween/tween";
import { AnimationListener } from "./models/animationlistener";

export type NamedAnimation = RenderEffectProps & {
    name: string;
    property: string;
    to: number|vec3;
    easing: TweenShape;
}

class AnimationSystem implements EngineSystem {
    namedAnimations: NamedAnimation[] = [];
    queuedAnimates:Animate[] = [];

    animating: Animation[] = [];

    constructor() {
        /*
        Should have this system listen to animate requests.
         */
        EngineBus.on(Render_Animate, this.queue.bind(this));
        EngineBus.on(Render_Clear_Animate, this.unqueue.bind(this));
    }

    registerAnimation(type: NamedAnimation) {
        if (this.namedAnimations.find(na => na.name === type.name)) {
            return;
        }

        //...
        this.namedAnimations.push(type);
    }

    queue(animate: Animate) {
        this.queuedAnimates.unshift(animate);
    }

    unqueue(animate: Animate) {
        
    }

    update(time: number) {
        let animate: Animate | undefined;
        while ((animate = this.queuedAnimates.pop()) !== undefined) {
            if (animate.name) {
                const registeredAnimation = this.namedAnimations.find(n => n.name === animate!.name);
                if (registeredAnimation) {
                    //...
                    continue;
                }
            }
            
            if (!animate.property) {
                console.error(`property undefined for animate event.`);
                continue;
            }

            if (!animate.target) {
                console.error(`target undefined for animate event.`);
                continue;
            }

            if (!animate.target[animate.property]) {
                console.error(`${animate.property} does not exist on target ${animate.target}.`);
                continue;
            }
            
            const anim = Animation.fromAnimate(animate);
            anim.setRenderEffectMode(animate.overlay??false, animate.override);

            if (this.canAnimationBeApplied(anim)) {
                this.animating.push(anim);
            }
        }

        //..run animations

        for (const animation of this.animating) {
            const currentTime = time ?? performance.now();
            let starting = false;
            if (animation.startingTime === -1) {
                animation.startingTime === currentTime;
                starting = true;
            }

            const endTime = animation.startingTime + animation.duration;
            if (endTime <= currentTime) {
                //finalise the end of the animation...
                if (animation.property === "position") {
                    if (typeof animation.value === "number") {
                        animation.target.position.x = animation.value;
                        animation.target.position.y = animation.value;
                    }
                    else {
                        animation.target.position.x = animation.value.x;
                        animation.target.position.y = animation.value.y;
                    }
                    
                }
                else {
                    animation.target[animation.property] = animation.value;
                }

                EngineBus.emit(Render_Animation_Finish, createEngineEvent(animation));
                let index = this.animating.findIndex(a => a === animation);
                if (index === -1) {
                    console.log(`concerning ${animation}`);
                    index = this.animating.findIndex(a => a.eventId === animation.eventId);
                    if (index !== -1) {
                        this.animating.splice(index, 1);
                    }
                    else {
                        throw new Error(`Could not find ${animation}. Pls fix logic.`);
                    }
                }
                else {
                    this.animating.splice(index, 1);
                }
                continue;
            }

            const diffTime = endTime - animation.startingTime;
            const timeFrac = diffTime / animation.duration;
            const easing = animation.easing ?? new TweenShape(0, 1);
            if (animation.property === "position") {
                const x = animation.target.position.x;
                const y = animation.target.position.y;
                if (starting) {
                    animation.setAnimationStartValue({x, y, z: 0});
                }

                let tweenedPosition;
                if (typeof animation.value === "number") {
                    tweenedPosition = TweenPosition(timeFrac, animation.getAnimationStartValue() as vec3, {x: animation.value, y: animation.value, z: 0}, easing);
                }
                else {
                    tweenedPosition = TweenPosition(timeFrac, animation.getAnimationStartValue() as vec3, {x: animation.value.x, y: animation.value.y, z: 0}, easing);
                }

                animation.target.position.x = tweenedPosition.x;
                animation.target.position.y = tweenedPosition.y;
            }
            else {
                const value = animation.target[animation.property];
                if (starting) {
                    animation.setAnimationStartValue(value);
                }

                const tweenedValue = Tween(timeFrac, animation.getAnimationStartValue() as number, animation.value as number, easing);
                animation.target[animation.property] = tweenedValue;
            }
        }
    }

    canAnimationBeApplied(animation: Animation): boolean {
        const conflictingTargets = this.animating.find(anim => {
            if (anim.target !== animation.target) {
                return false;
            }

            const mode = animation.getRenderEffectMode();

            if ((mode & RenderEffectFlags.RE_OVERLAY) && anim.property !== animation.property) {
                return false;
            }

            if ((mode & RenderEffectFlags.RE_OVERRIDE) && anim.property === animation.property) {
                return false;
            }

            return true;
        });

        if (conflictingTargets) {
            return false;
        }

        return true;
    }

    subscribeToAnimationEvents(listener: AnimationListener) {
        EngineBus.on(Render_Animation_Finish, listener.onAnimationsFinish.bind(listener));
    }
}