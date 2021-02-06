import React from 'react'
import { Body as MatterBody, Vector } from 'matter-js'

import playerSprite from 'assets/images/archer_sprites.png'
import { COLLIDERS } from 'config'
import { Body, Sprite } from 'components/GameKit'
import { useKeyListener } from 'components/GameKit/hooks'
import Arrow from 'components/Arrow'

// Collision with default object only
const COLLISION_FILTER = {
  category: COLLIDERS.player,
  mask: COLLIDERS.default,
}

const PLAYER_BODY = [250, 250, 32, 32]

const SPRITE_STEPS = [
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
  5,
]

/**
 * Returns the sprite sheet state offset according to the orientation of the character.
 * @param {Object} vector character orientation { x, y }
 */
const getOrientation = (vector) => {
  const { x, y } = vector
  if (x === -1) {
    if (y === -1) return 6
    if (y === 0) return 2
    if (y === 1) return 5
  }
  if (x === 0) {
    if (y === -1) return 1
    if (y === 0) return -1
    if (y === 1) return 3
  }
  if (x === 1) {
    if (y === -1) return 7
    if (y === 0) return 0
    if (y === 1) return 4
  }
}

/**
 * Returns the speed of the character according to his state.
 * @param {String} state character state ['AIMING', 'RUNNING', 'ROLLING']
 */
const getSpeed = (state) => {
  switch (state) {
    case 'AIMING':
      return 2
    case 'RUNNING':
      return 3
    case 'ROLLING':
      return 6
    default:
      return 0
  }
}

/**
 * Return the state in the sprite sheet.
 * @param {Object} orientation character orientation { x, y }
 * @param {String} state character state ['AIMING', 'ROLLING']
 */
const getSpriteState = (orientation, state) => {
  switch (state.value) {
    case 'ROLLING':
      return getOrientation(orientation) + 8
    case 'AIMING':
      return getOrientation(orientation) + 16 + (!state.can.shot ? 8 : 0)
    default:
      return getOrientation(orientation)
  }
}

/**
 * Player component.
 */
const Player = () => {
  /**
   * Arrow props.
   */
  const [arrow, setArrow] = React.useState({
    direction: { x: 0, y: 0 },
    shot: false,
    startPosition: { x: 0, y: 0 },
  })
  /**
   * Player state.
   */
  const [player, setPlayer] = React.useState({
    state: 'IDLE',
    orientation: { x: 0, y: 1 },
  })

  /**
   * Object used to restrict some actions (if `false`).
   */
  const playerCan = React.useRef({ roll: true, shot: true })

  /**
   * Function used to bind key event to action.
   */
  const isDown = useKeyListener(['q', 'd', 'z', 's', 'space', 'shift'])

  /**
   * Sprite animation callback.
   */
  const handleAnimation = React.useCallback(
    (event) => {
      // End of rolling animation
      if (player.state === 'ROLLING' && event === 'END') {
        setPlayer((prevState) => ({ ...prevState, state: 'IDLE' }))
        const timeout = setTimeout(() => {
          playerCan.current.roll = true
          clearTimeout(timeout)
        }, 1000)
      }
    },
    [player.state]
  )

  /**
   * Body update callback.
   */
  const handleUpdate = React.useCallback(
    (playerBody) => {
      let movement = { x: 0, y: 0 }

      if (isDown('q')) {
        movement.x -= 1
      }
      if (isDown('d')) {
        movement.x += 1
      }
      if (isDown('z')) {
        movement.y -= 1
      }
      if (isDown('s')) {
        movement.y += 1
      }

      setPlayer((prevPlayer) => {
        const { state: prevState, orientation: prevOrientation } = prevPlayer
        // Movement direction
        let newDirection = movement
        // Character orientation
        let newOrientation = movement
        let newState = prevState
        let shouldMove = movement.x || movement.y

        if (shouldMove) {
          newState = 'RUNNING'
        } else {
          newOrientation = prevOrientation
          newState = 'IDLE'
        }

        if (isDown('space') && playerCan.current.roll) {
          newState = 'ROLLING'
          playerCan.current.roll = false
        }

        if (isDown('shift')) {
          newState = 'AIMING'
        }

        if (newState === 'AIMING') {
          newOrientation = prevOrientation

          if (playerCan.current.shot)
            setArrow((prevArrow) => {
              const { x, y } = { ...playerBody.position }
              if (prevArrow.shot) return prevArrow
              else
                return {
                  direction: newOrientation,
                  shot: false,
                  startPosition: { x, y },
                }
            })
        } else if (prevState === 'AIMING') {
          playerCan.current.shot = false
          setArrow((prevArrow) => ({
            ...prevArrow,
            shot: true,
          }))
        }

        if (prevState === 'ROLLING') {
          newDirection = prevOrientation
          newOrientation = prevOrientation
          newState = 'ROLLING'
        }

        const speed = shouldMove && getSpeed(newState)

        if (speed)
          MatterBody.setVelocity(
            playerBody,
            Vector.mult(Vector.normalise(newDirection), speed)
          )

        if (prevState === newState && prevOrientation === newOrientation)
          return prevPlayer
        else
          return {
            state: newState,
            orientation: newOrientation,
          }
      })
    },
    [isDown]
  )

  /**
   * Arrow collision callback, used to unmount the arrow on collision with the border.
   */
  const onArrowCollision = React.useCallback((event) => {
    if (event === 'BORDER') {
      setArrow({
        direction: { x: 0, y: 0 },
        shot: false,
        startPosition: { x: 0, y: 0 },
      })
      playerCan.current.shot = true
    }
  }, [])

  return (
    <>
      <Body
        args={PLAYER_BODY}
        debug={false}
        onUpdate={handleUpdate}
        frictionAir={0.1}
        label="player"
        inertia={Infinity}
        collisionFilter={COLLISION_FILTER}
      >
        <Sprite
          onChange={handleAnimation}
          src={playerSprite}
          repeat={player.state === 'RUNNING' || player.state === 'AIMING'}
          scale={1}
          state={getSpriteState(player.orientation, {
            value: player.state,
            can: { shot: playerCan.current.shot },
          })}
          steps={SPRITE_STEPS}
          ticksPerFrame={player.state === 'ROLLING' ? 3 : 5}
          tileHeight={34}
          tileWidth={32}
        />
      </Body>
      {arrow.shot && <Arrow {...arrow} onCollision={onArrowCollision} />}
    </>
  )
}

export default Player
