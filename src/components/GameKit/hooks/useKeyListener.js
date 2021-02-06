import React from 'react'
import { KEYS } from 'components/GameKit/utils'

/**
 * Keep track of which keyboard key is down.
 * It exposes the `isDown` function.
 * @param {Array} keys array of keyboard keys.
 */
const useKeyListener = (keys) => {
  /**
   * Object containing the listened keys.
   * The value are `true` when the key is pressed and `false` otherwise.
   */
  const subscribedKeys = React.useRef({})

  /**
   * This is needed in order not to use the `keys` prop in the useEffect.
   * It is necessary because the eslint react-hooks/exhaustive-deps rule would not be respected
   * as `keys` can't be a dependency of the useEffect because the deep equality trigger the hook at each re-render.
   * A `JSON.parse()` is performed in the useEffect to retrieve the array.
   */
  const stringifiedKeys = JSON.stringify(keys)

  /**
   * Initialize the listener.
   */
  React.useEffect(() => {
    const down = (event) => {
      if (event.keyCode in subscribedKeys.current) {
        event.preventDefault()
        subscribedKeys.current[event.keyCode] = true
      }
    }
    const up = (event) => {
      if (event.keyCode in subscribedKeys.current) {
        event.preventDefault()
        subscribedKeys.current[event.keyCode] = false
      }
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    const keys = JSON.parse(stringifiedKeys)
    keys.forEach((_key) => {
      const keyCode = KEYS[_key] || _key
      subscribedKeys.current[keyCode] = false
    })

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      subscribedKeys.current = {}
    }
  }, [stringifiedKeys])

  /**
   * Returns `true` if the key is down. `false`otherwise.
   * @param {String} _key key name to check.
   */
  const isDown = React.useCallback((_key) => {
    const keyCode = KEYS[_key] || _key
    return subscribedKeys.current[keyCode] || false
  }, [])

  return isDown
}

export default useKeyListener
