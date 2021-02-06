import React from 'react'
import PropTypes from 'prop-types'

import { useLoop } from 'components/GameKit/components/Loop'
import { useStage } from 'components/GameKit/components/Stage'

/**
 * Component used to display and animate a sprite.
 */
const Sprite = ({
  offset = [0, 0],
  onChange = null,
  repeat = false,
  scale = 1,
  src,
  state = 0,
  steps = [],
  style,
  ticksPerFrame = 4,
  tileHeight = 32,
  tileWidth = 32,
}) => {
  /**
   * Current step of the animation.
   */
  const [currentStep, setCurrentStep] = React.useState(0)
  /**
   * WHether the animation has ended or not.
   */
  const [finished, setFinished] = React.useState(false)

  /**
   * Used to time animation.
   */
  const animationTick = React.useRef(0)

  /**
   * Functions used to subscribe/unsubscribe the `animate` function to the Game Loop.
   */
  const { subscribe, unsubscribe } = useLoop()
  /**
   * Game Stage scale. Used to re-scale the Body if needed.
   */
  const { scale: stageScale } = useStage()

  /**
   * Function performing the animation, i.e. the update of `animationTick`, `currentStep` and `finished`.
   */
  const animate = React.useCallback(() => {
    if (animationTick.current === ticksPerFrame) {
      if (steps[state] !== 0) {
        setCurrentStep((prevCurrentStep) => {
          if (prevCurrentStep === steps[state]) {
            if (repeat) return 0
            else {
              setFinished(true)
              return prevCurrentStep
            }
          } else return prevCurrentStep + 1
        })
      }
      animationTick.current = 0
    } else {
      animationTick.current += 1
    }
  }, [repeat, state, steps, ticksPerFrame])

  /**
   * Handle the subscription of the `animate` function to the Game Loop.
   * Set the initial state of a animation.
   */
  React.useEffect(() => {
    setFinished(false)
    setCurrentStep(0)
    animationTick.current = 0

    if (steps.length && steps[0]) {
      const newSubscription = subscribe(animate)

      return () => unsubscribe(newSubscription)
    }
  }, [animate, state, steps, subscribe, unsubscribe])

  /**
   * Side effect used to trigger the parent `onChange` function.
   * If the parameter is 'START', the animation has just started.
   * If the parameter is 'END', the animation has just ended.
   */
  React.useEffect(() => {
    onChange && onChange(finished ? 'END' : 'START')
  }, [finished, onChange])

  /**
   * <img/> style function.
   */
  const getImageStyles = () => {
    const left = -1 * (offset[0] + (finished ? 0 : currentStep) * tileWidth)
    const top = -1 * (offset[1] + state * tileHeight)

    return {
      position: 'absolute',
      transform: `translate(${left}px, ${top}px)`,
    }
  }

  /**
   * <div/> style function.
   */
  const getWrapperStyles = () => ({
    height: tileHeight,
    width: tileWidth,
    overflow: steps[state] === 0 ? 'none' : 'hidden',
    position: 'relative',
    transform: `scale(${scale * stageScale})`,
    transformOrigin: 'top left',
    imageRendering: 'pixelated',
  })

  return (
    <div style={{ ...getWrapperStyles(), ...style }}>
      <img alt="sprite" style={getImageStyles()} src={src} />
    </div>
  )
}

Sprite.propTypes = {
  /**
   * Number of pixel the image should be translated. [ x offset, y offset ]
   */
  offset: PropTypes.arrayOf([PropTypes.number]),
  /**
   * Callback function trigger on animation start and on animation end.
   */
  onChange: PropTypes.func,
  /**
   * Whether the animation should restart after it ends or not.
   */
  repeat: PropTypes.bool,
  /**
   * Scale factor to apply to the image.
   */
  scale: PropTypes.number,
  /**
   * Source url of the sprite or sprite sheet.
   */
  src: PropTypes.string.isRequired,
  /**
   * Current state in the sprite sheet.
   * A state is basically a row in the sprite sheet.
   */
  state: PropTypes.number,
  /**
   * Number of frames by animation state. [ number of image of state `0`, ... ]
   */
  steps: PropTypes.arrayOf(PropTypes.number),
  /**
   * Additional style to apply to the wrapper <div/>.
   */
  style: PropTypes.object,
  /**
   * Number of `animationTick` by animation frame.
   */
  ticksPerFrame: PropTypes.number,
  /**
   * Height of a frame.
   */
  tileHeight: PropTypes.number,
  /**
   * Width of a frame.
   */
  tileWidth: PropTypes.number,
}

export default Sprite
