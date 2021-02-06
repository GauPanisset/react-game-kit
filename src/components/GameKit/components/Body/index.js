import React from 'react'
import PropTypes from 'prop-types'
import { Bodies, Vector, World } from 'matter-js'

import { useLoop } from 'components/GameKit/components/Loop'
import { useStage } from 'components/GameKit/components/Stage'
import { useWorld } from 'components/GameKit/components/World'

/**
 * Game object using physic to move, collide with other bodies, etc...
 * It is based on the library 'matter-js'.
 */
const Body = ({
  args = [0, 0, 100, 100],
  children,
  debug = false,
  onCollision = null,
  onUpdate = null,
  shape = 'rectangle',
  ...options
}) => {
  /**
   * Ref used to manipulate the MatterJS Body.
   */
  const bodyRef = React.useRef(
    Bodies[shape](
      args[0] + args[2] / 2,
      args[1] + args[3] / 2,
      args[2],
      args[3],
      options
    )
  )
  /**
   * Position of the Body.
   * It is a React state since a re-render is needed on change.
   */
  const [position, setPosition] = React.useState({
    x: args[0] + args[2] / 2,
    y: args[1] + args[3] / 2,
  })

  /**
   * Functions used to subscribe/unsubscribe the `onUpdate` function to the Game Loop.
   */
  const { subscribe, unsubscribe } = useLoop()
  /**
   * Game Stage scale. Used to re-scale the Body if needed.
   */
  const { scale } = useStage()
  /**
   * Functions used to subscribe/unsubscribe the `onUpdate` function to the World `collisionStart` event.
   */
  const { engine, subscribeToCollision, unsubscribeFromCollision } = useWorld()

  /**
   * Handle the addition of the MatterJS Body in the MatterJS World and the subscription of `onCollision` to the World `collisionStart` event.
   */
  React.useEffect(() => {
    const currentBody = bodyRef.current

    World.addBody(engine.world, currentBody)

    let collisionCallbackIndex
    if (onCollision) {
      const collisionCallback = (event) => {
        const filteredPairs = event.pairs
          .map((pair) => {
            const newPair = { ...pair }
            delete newPair.bodyA
            delete newPair.bodyB
            if (pair.bodyA.id === bodyRef.current.id)
              return { ...newPair, body: pair.bodyA, otherBody: pair.bodyB }
            if (pair.bodyB.id === bodyRef.current.id)
              return { ...newPair, body: pair.bodyB, otherBody: pair.bodyA }
            return null
          })
          .filter(Boolean)

        if (filteredPairs.length)
          onCollision({ ...event, pairs: filteredPairs })
      }
      collisionCallbackIndex = subscribeToCollision(collisionCallback)
    }

    return () => {
      World.remove(engine.world, currentBody)
      if (collisionCallbackIndex)
        unsubscribeFromCollision(collisionCallbackIndex)
    }
  }, [
    bodyRef,
    engine.world,
    onCollision,
    subscribeToCollision,
    unsubscribeFromCollision,
  ])

  /**
   * Handle the subscription of the `onUpdate` function to the Game Loop.
   */
  React.useEffect(() => {
    const update = () => {
      onUpdate && onUpdate(bodyRef.current)

      setPosition((prevPosition) => {
        /**
         * * MatterJS can give a stable position after a movement (there are always some residual moves).
         * * That is why the distance between to consecutive position should be more than 0.1 (arbitrary) to update the actual Body position.
         */
        if (
          Vector.magnitude(Vector.sub(bodyRef.current.position, prevPosition)) >
          0.1
        )
          return { ...bodyRef.current.position }
        else return prevPosition
      })
    }

    const newSubscription = subscribe(update)

    return () => {
      unsubscribe(newSubscription)
    }
  }, [onUpdate, subscribe, unsubscribe])

  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.y * scale}px`,
        left: `${position.x * scale}px`,
        height: args[3] * scale,
        width: args[2] * scale,
        border: debug && '1px solid #607d8b',
        backgroundColor: debug && '#607d8b33',
        transform: `translate(-50%, -50%) rotate(${bodyRef.current.angle}rad)`,
      }}
    >
      {children}
    </div>
  )
}

Body.propTypes = {
  /**
   * Main args of the MatterJS Bodies[shape] function.
   * Basically it is [ X body center, Y object center, body width, body height].
   */
  args: PropTypes.arrayOf(PropTypes.number),
  /**
   * In debug mode a border and a background around the Body are displayed.
   */
  debug: PropTypes.bool,
  /**
   * Callback function triggered when the Body collide with an other Body.
   */
  onCollision: PropTypes.func,
  /**
   * Callback function triggered are each Game Loop iteration.
   */
  onUpdate: PropTypes.func,
  /**
   * All options of MatterJS Bodies[shape] function.
   * See documentation for details. https://brm.io/matter-js/docs/classes/Body.html#properties
   */
  options: PropTypes.object,
  /**
   * TODO Add more shape to handle different shape of collider bodies.
   */
  shape: PropTypes.oneOf(['rectangle']),
}

export default Body
