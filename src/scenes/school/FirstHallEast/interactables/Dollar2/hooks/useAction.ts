// Libraries
import { useAppSelector } from 'state/hooks';

// Sequences
import { take } from '../sequences';

export const useAction = () => {
  const state = useAppSelector((state) => ({
    // TODO: Pull out the state you need here
  }));

  // TODO: Conditionally return an action to perform
  // if (smash_or_pass.ended) {
  //   if (home_bedroom.alarm === 'off') return smashOrPassOff;
  // }

  // This is just for type safety, we should never reach this point
  return take();
};