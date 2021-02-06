import React from 'react'

import rockSprite from 'assets/images/archer_rock.png'

import { Body, Sprite } from 'components/GameKit'

const ROCK_BODY = [502, 130, 140, 75]

/**
 * Just a rock.
 */
const Rock = () => {
  return (
    <Body args={ROCK_BODY} isStatic={true} debug={false} label="rock">
      <Sprite
        offset={[12, 20]}
        src={rockSprite}
        repeat={false}
        scale={1}
        state={0}
        steps={[0]}
        tileHeight={115}
        tileWidth={164}
      />
    </Body>
  )
}

export default Rock
