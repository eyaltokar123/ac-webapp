// Libraries
import React from 'react';
import { useAppSelector } from 'state/hooks';

// Components
import Interactable, { InteractableConfig } from 'components/Interactable';

// Definitions
import { useAction } from './hooks/useAction';

export const Dollar3: React.FC<InteractableConfig> = ({ offset }) => {
  const title = 'Money';
  const description = '';
  const action = useAction();
  const shouldRender = useAppSelector(
    (state) =>
      state.scene.school_art_class.dollar3_spawned_today &&
      !state.scene.school_art_class.dollar3_taken_today
  );

  return (
    <Interactable
      id="dollar3"
      asset="assets/locations/school/art_class/dollar3.webp"
      nameplate={{ title, description }}
      action={action}
      offset={offset}
      render={shouldRender ?? false}
    />
  );
};

export default Dollar3;