import React from 'react'
import PropTypes from 'prop-types'

export const StageContext = React.createContext()
export const useStage = () => React.useContext(StageContext)

/**
 * Component used to keep track of the dimension of the game layout.
 * It exposes a `scale` factor used to resize children elements.
 */
const Stage = ({ children, height = 576, width = 1024 }) => {
  /**
   * Used to get the real size of the container on resize.
   */
  const containerRef = React.useRef()

  /**
   * Dimensions computed according to the real size of the container.
   */
  const [dimensions, setDimensions] = React.useState({
    rHeight: height,
    rWidth: width,
    scale: 1,
  })

  /**
   * Function computing the game layout dimension according to container size and constraints (props).
   */
  const computeDimension = React.useCallback(() => {
    let newDimensions = {
      rHeight: height,
      rWidth: width,
      scale: 1,
    }

    if (containerRef.current) {
      const vHeight = containerRef.current.offsetHeight
      const vWidth = containerRef.current.offsetWidth

      if (height / width > vHeight / vWidth) {
        newDimensions.rHeight = vHeight
        newDimensions.rWidth = (newDimensions.rHeight * width) / height
        newDimensions.scale = vHeight / height
      } else {
        newDimensions.rWidth = vWidth
        newDimensions.rHeight = (newDimensions.rWidth * height) / width
        newDimensions.scale = vWidth / width
      }
    }

    setDimensions(newDimensions)
  }, [height, width])

  /**
   * Handle dimension re-compute on resize.
   */
  React.useEffect(() => {
    window.addEventListener('resize', computeDimension)
    computeDimension()

    return () => window.removeEventListener('resize', computeDimension)
  }, [computeDimension])

  const stageContext = React.useMemo(() => ({ ...dimensions }), [dimensions])

  return (
    <StageContext.Provider value={stageContext}>
      <div
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
        ref={containerRef}
      >
        <div
          style={{
            height: Math.floor(dimensions.rHeight),
            width: Math.floor(dimensions.rWidth),
          }}
        >
          {containerRef.current ? children : ''}
        </div>
      </div>
    </StageContext.Provider>
  )
}

Stage.propTypes = {
  /**
   * Game layout height.
   */
  height: PropTypes.number,
  /**
   * Game layout width.
   */
  width: PropTypes.number,
}

export default Stage
