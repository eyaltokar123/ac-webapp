// TODO: Update the interactable name and default export, use TitleCase
// TODO: Update the id - must be unique to the scene (globally unique not necessary)
// TODO: Update asset path (eg. assets/locations/home/bedroom/door.webp)

// Libraries
import React from 'react';

// Components
import Interactable, { InteractableConfig } from 'components/Interactable';

// Definitions
import { useAction } from './hooks/useAction';
import { useDescription } from './hooks/useDescription';
import { useTitle } from './hooks/useTitle';

export const UPDATE_ME: React.FC<InteractableConfig> = ({ offset }) => {
  const title = useTitle();
  const description = useDescription();
  const action = useAction();

  return (
    <Interactable
      id="id-unique-to-scene"
      asset="path/to/asset/here.webp"
      nameplate={{ title, description }}
      action={action}
      offset={offset}
      render={true}
    />
  );
};

export default UPDATE_ME;