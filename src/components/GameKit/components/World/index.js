import React from 'react'
import PropTypes from 'prop-types'
import { World as MatterWorld, Engine, Events } from 'matter-js'

import { useLoop } from 'components/GameKit/components/Loop'

import { useSubscription } from 'components/GameKit/hooks'

const WorldContext = React.createContext()
export const useWorld = () => React.useContext(WorldContext)

/**
 * Component used to setup the MatterJS Engine and World.
 * It exposes the engine and enable subscription to the event `collisionStart`.
 */
const World = ({ children, gravity = null, onInit = null }) => {
  /**
   * MatterJS engine.
   */
  const [engine, setEngine] = React.useState()

  /**
   * Ref used to keep track of the time on engine update.
   */
  const lastTime = React.useRef()

  /**
   * Functions used to subscribe/unsubscribe the `worldUpdate` function to the Game Loop.
   */
  const { subscribe, unsubscribe } = useLoop()
  /**
   * Enable subscription of callback functions to the engine event `collisionStart`.
   */
  const {
    subscribers: collisionSubscribers,
    subscribe: subscribeToCollision,
    unsubscribe: unsubscribeFromCollision,
  } = useSubscription()

  /**
   * Handle MatterJS World and Engine creation and `worldUpdate` subscription to the Game Loop.
   */
  React.useEffect(() => {
    const newWorld = MatterWorld.create({
      gravity: gravity || {
        x: 0,
        y: 1,
        scale: 0.001,
      },
    })
    const newEngine = Engine.create({ world: newWorld })

    onInit && onInit(newEngine)

    const worldUpdate = () => {
      const currentTime = 0.001 * Date.now()
      Engine.update(
        newEngine,
        1000 / 60,
        lastTime.current ? currentTime / lastTime.current : 1
      )
      lastTime.current = currentTime
    }

    setEngine(newEngine)

    const newSubscription = subscribe(worldUpdate)

    return () => {
      unsubscribe(newSubscription)
      Engine.clear(newEngine)

      setEngine()
      lastTime.current = null
    }
  }, [gravity, onInit, subscribe, unsubscribe])

  /**
   * Handle subscription of callback function to the `collisionStart` event.
   */
  React.useEffect(() => {
    if (engine) {
      const collisionCallback = (event) => {
        collisionSubscribers.current.forEach(
          (callback) => callback && callback(event)
        )
      }

      Events.on(engine, 'collisionStart', collisionCallback)

      return () => Events.off(engine, 'collisionStart', collisionCallback)
    }
  }, [collisionSubscribers, engine])

  const worldContext = React.useMemo(
    () => ({ engine, subscribeToCollision, unsubscribeFromCollision }),
    [engine, subscribeToCollision, unsubscribeFromCollision]
  )

  return (
    <WorldContext.Provider value={worldContext}>
      {engine ? children : ''}
    </WorldContext.Provider>
  )
}

World.propTypes = {
  /**
   * Gravity in the Game World.
   */
  gravity: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    scale: PropTypes.number.isRequired,
  }),
  /**
   * Function triggered after the creation of the MatterJS World.
   */
  onInit: PropTypes.func,
}

export default World
