import React from 'react'

import { useSubscription } from 'components/GameKit/hooks'

const LoopContext = React.createContext()
export const useLoop = () => React.useContext(LoopContext)

/**
 * Create the Game Loop with a requestAnimationFrame.
 * Each subscribed callback are call at each iteration.
 *
 * It exposes a context enabling subscription to the loop.
 */
const Loop = ({ children }) => {
  const { subscribers, subscribe, unsubscribe } = useSubscription()

  React.useEffect(() => {
    const update = () => {
      subscribers.current.forEach((callback) => callback && callback())
      requestAnimationFrame(update)
    }

    const newLoopId = requestAnimationFrame(update)

    return () => cancelAnimationFrame(newLoopId)
  }, [subscribers])

  const loopContext = { subscribe, unsubscribe }

  return (
    <LoopContext.Provider value={loopContext}>{children}</LoopContext.Provider>
  )
}

export default Loop
