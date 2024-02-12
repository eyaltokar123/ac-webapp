// Libraries
import React, { memo } from 'react';
import { useAppSelector } from 'state/hooks';
import { getEquipment } from 'state/features/character';

// Components
import Expression, { Asset } from 'components/Expression';

// Data
import data from '../data.json';

export const FloraSkeptical: React.FC = () => {
  const {
    panties,
    bra,
    pants,
    skirt,
    shirt,
    hat,
    blindfold,
    vines,
    cum,
    wet,
    hands_up,
  } = useAppSelector((state) => getEquipment(state.character.flora));

  return (
    <Expression id="flora" definitions={data.body2}>
      {wet ? (
        <>
          <Asset name="body2_wet" layer="base" />
          <Asset name="face_skeptical_wet" layer="base" />
        </>
      ) : (
        <>
          <Asset name="body2" layer="base" />
          <Asset name="face_skeptical" layer="base" />
        </>
      )}

      {hands_up ? (
        <Asset name="b2arm2_n" layer="base" />
      ) : (
        <Asset name="b2arm1_n" layer="base" />
      )}

      {panties && <Asset name="b2panty" layer="underwear" />}
      {bra && <Asset name="b2bra" layer="underwear" />}

      {pants && !skirt && <Asset name="b2pants" layer="clothes" />}
      {skirt && !pants && <Asset name="b2skirt" layer="clothes" />}
      {hat && <Asset name="b2chefhat" layer="clothes" />}
      {blindfold && <Asset name="b2bandage" layer="clothes" />}
      {vines && <Asset name="b2vine" layer="clothes" />}
      {cum && <Asset name="b2cum" layer="clothes" />}
      {wet && <Asset name="b2water_drops" layer="clothes" />}

      {shirt && (
        <>
          {skirt ? (
            <>
              {wet ? (
                <Asset name="b2shirt_knotted_wet" layer="clothes" />
              ) : (
                <Asset name="b2shirt_knotted" layer="clothes" />
              )}
            </>
          ) : (
            <>
              {wet ? (
                <Asset name="b2shirt_wet" layer="clothes" />
              ) : (
                <Asset name="b2shirt" layer="clothes" />
              )}
            </>
          )}

          {hands_up ? (
            <Asset name="b2arm2_c" layer="base" />
          ) : (
            <Asset name="b2arm1_c" layer="base" />
          )}
        </>
      )}
    </Expression>
  );
};

export default memo(FloraSkeptical);