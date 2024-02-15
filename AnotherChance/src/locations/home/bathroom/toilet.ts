import {
    EngineBus,
    createEngineEvent,
    getEngine,
} from "../../../../../src/engine";
import { Transition_Scene } from "../../../../../src/engine/scene/models";
import SceneTransitionFlags from "../../../../../src/engine/scene/models/scenetransitions";
import { START_DIALOGUE } from "../../../../../src/gameplay/dialogue";
import BathroomToilet from "../../../../assets/locations/home/bathroom/toilet.webp";

const bathroomToilet = await getEngine().createSimpleInteractable(
    "bathroom_toilet",
    {
        action: "interact",
        handler: () => {
            EngineBus.emit(
                START_DIALOGUE,
                createEngineEvent(START_DIALOGUE, {
                    dialogueId: "ToiletDialogue",
                })
            );
        },
    },
    { source: BathroomToilet }
);
bathroomToilet.anchor.set(0.5);
let pos = getEngine().SPR(0.35, 0.5);
bathroomToilet.setTransform(pos.x, pos.y);

export default bathroomToilet;