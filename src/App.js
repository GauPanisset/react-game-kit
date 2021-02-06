import React from 'react'
import { Bodies, World as MatterWorld } from 'matter-js'

import forestBackground from 'assets/images/archer_forest.png'
import treesBackground from 'assets/images/archer_trees.png'
import { Loop, Stage, World } from 'components/GameKit'

import { SIZE } from 'config'
import Player from 'components/Player'
import Rock from 'components/Rock'

const App = () => {
  const createBorders = (engine) => {
    const { height, width } = SIZE
    const borderWidth = 20
    MatterWorld.add(engine.world, [
      Bodies.rectangle(width / 2, -borderWidth / 2, width, borderWidth, {
        label: 'border',
        isStatic: true,
      }),
      Bodies.rectangle(
        width + borderWidth / 2,
        height / 2,
        borderWidth,
        height,
        {
          label: 'border',
          isStatic: true,
        }
      ),
      Bodies.rectangle(
        width / 2,
        height + borderWidth / 2,
        width,
        borderWidth,
        {
          label: 'border',
          isStatic: true,
        }
      ),
      Bodies.rectangle(-borderWidth / 2, height / 2, borderWidth, height, {
        label: 'border',
        isStatic: true,
      }),
    ])
  }

  return (
    <Loop>
      <Stage>
        <World gravity={{ x: 0, y: 0, scale: 0.001 }} onInit={createBorders}>
          <div
            style={{
              position: 'relative',
              backgroundImage: `url(${forestBackground})`,
              backgroundSize: 'cover',
              height: '100%',
              width: '100%',
            }}
          >
            <Player />
            <Rock />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundImage: `url(${treesBackground})`,
                backgroundSize: 'cover',
                height: '100%',
                width: '100%',
                pointerEvents: 'none',
              }}
            />
          </div>
        </World>
      </Stage>
    </Loop>
  )
}

export default App
