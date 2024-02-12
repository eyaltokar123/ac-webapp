// Libraries
import React from 'react';

// Components
import Interactable, { InteractableConfig } from 'components/Interactable';

// Definitions
import { useAction } from './hooks/useAction';
import { useDescription } from './hooks/useDescription';

export const SwimTeamPhotos: React.FC<InteractableConfig> = ({ offset }) => {
  const title = 'Swim Team Photos';
  const description = useDescription();
  const action = useAction();

  return (
    <Interactable
      id="swim_team_photos"
      asset="assets/locations/school/first_hall_east/photos.webp"
      nameplate={{ title, description }}
      action={action}
      offset={offset}
      render={true}
    />
  );
};

export default SwimTeamPhotos;