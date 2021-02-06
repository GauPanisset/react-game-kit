import React from 'react'
import PropTypes from 'prop-types'
import { Body as MatterBody, Vector } from 'matter-js'

import arrowSprite from 'assets/images/archer_arrow.png'
import { COLLIDERS } from 'config'
import { Body, Sprite } from 'components/GameKit'

// Collision with default object only
const COLLISION_FILTER = {
  category: COLLIDERS.arrow,
  mask: COLLIDERS.default,
}

const getDirection = (vector) => {
  const { x, y } = vector

  if (x === -1) {
    if (y === -1) return (Math.PI * 5) / 4
    if (y === 0) return Math.PI
    if (y === 1) return (Math.PI * 3) / 4
  }
  if (x === 0) {
    if (y === -1) return (Math.PI * 3) / 2
    if (y === 0) return 0
    if (y === 1) return Math.PI / 2
  }
  if (x === 1) {
    if (y === -1) return (Math.PI * 7) / 4
    if (y === 0) return 0
    if (y === 1) return Math.PI / 4
  }
}

const Arrow = ({ direction, onCollision, shot, startPosition }) => {
  const args = React.useMemo(() => [startPosition.x, startPosition.y, 16, 5], [
    startPosition,
  ])

  const handleArrow = React.useCallback(
    (arrowBody) => {
      if (shot) {
        MatterBody.setVelocity(
          arrowBody,
          Vector.mult(Vector.normalise(direction), 12)
        )
      } else {
        // TODO Remove since it seems to be unnecessary.
        MatterBody.setPosition(
          arrowBody,
          Vector.create(startPosition.x, startPosition.y)
        )
      }
    },
    [direction, shot, startPosition.x, startPosition.y]
  )

  const handleArrowCollision = React.useCallback(
    (event) => {
      if (event.pairs.filter((pair) => pair.otherBody.label === 'border')) {
        onCollision('BORDER')
      }
    },
    [onCollision]
  )

  return (
    <Body
      args={args}
      debug={false}
      onCollision={handleArrowCollision}
      onUpdate={handleArrow}
      angle={getDirection(direction)}
      collisionFilter={COLLISION_FILTER}
      label="arrow"
    >
      <Sprite
        src={arrowSprite}
        repeat={false}
        scale={1}
        state={0}
        steps={[0]}
        ticksPerFrame={1}
        tileHeight={5}
        tileWidth={16}
      />
    </Body>
  )
}

Arrow.propTypes = {
  /**
   * Orientation and direction of the arrow { x, y }.
   */
  direction: PropTypes.object,
  /**
   * Callback function used to manage collision on the parent level.
   */
  onCollision: PropTypes.func,
  /**
   * Whether the arrow has been shot or not.
   * TODO Remove since it seems to be unnecessary.
   */
  shot: PropTypes.bool,
  /**
   * Start position of the arrow when mounted.
   */
  startPosition: PropTypes.object,
}

export default Arrow
