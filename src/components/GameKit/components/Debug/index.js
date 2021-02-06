import React from 'react'

/**
 * A UI helper used to display a debug text in game.
 */
const Debug = ({ children }) => {
  return (
    <div
      style={{
        position: 'relative',
        top: 24,
        width: 'fit-content',
        padding: 4,
        borderRadius: 4,
        border: '1px dashed #607d8b',
        backgroundColor: '#607d8b33',
      }}
    >
      {children}
    </div>
  )
}

export default Debug
