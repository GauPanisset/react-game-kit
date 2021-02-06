import React from 'react'

/**
 * Handle subscriptions.
 */
const useSubscription = () => {
  /**
   * Contains all subscribed items.
   */
  const subscribers = React.useRef([])

  /**
   * Subscribe to a list. It returns the index of the element in the subscribers array.
   * @param {Any} callback
   */
  const subscribe = React.useCallback((callback) => {
    let nextId = subscribers.current.findIndex((subscriber) => !subscriber)
    if (nextId === -1) {
      nextId = subscribers.current.push(callback) - 1
    } else {
      subscribers.current[nextId] = callback
    }
    return nextId
  }, [])

  /**
   * Unsubscribe the callback with the index `index` in the subscribers array.
   * @param {Number} index
   */
  const unsubscribe = React.useCallback((index) => {
    subscribers.current[index] = null
  }, [])

  return {
    subscribers,
    subscribe,
    unsubscribe,
  }
}

export default useSubscription
