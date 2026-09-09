import React, { useRef, useEffect, useLayoutEffect } from 'react'
import { usePicker } from '../context.js'
import usePaintHue from '../hooks/usePaintHue.js'
import { getHandleValue } from '../utils/utils.js'
import tinycolor from 'tinycolor2'

const Hue = () => {
  const barRef = useRef<HTMLCanvasElement>(null)
  const {
    config,
    handleChange,
    squareWidth,
    hc,
    setHc,
    pickerIdSuffix,
    startInteraction,
  } = usePicker()
  const { barSize } = config
  usePaintHue(barRef, squareWidth)

  const hueRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const didDragRef = useRef(false)
  const pendingHueRef = useRef<number | null>(null)
  const displayHueRef = useRef(hc?.h ?? 0)
  const frameRef = useRef<number | null>(null)
  const hcRef = useRef(hc)
  const handleChangeRef = useRef(handleChange)

  useEffect(() => {
    hcRef.current = hc
    handleChangeRef.current = handleChange
  }, [hc, handleChange])

  useLayoutEffect(() => {
    if (!draggingRef.current) {
      displayHueRef.current = hc?.h ?? 0
      if (handleRef.current) {
        handleRef.current.style.left = `${displayHueRef.current * ((squareWidth - 18) / 360)}px`
      }
    }
  }, [hc?.h, squareWidth])

  const handleDown = () => {
    startInteraction()
    draggingRef.current = true
    didDragRef.current = false
  }

  const handleHue = (x: number) => {
    if (hueRef.current) {
      const newHue = getHandleValue(x, hueRef.current, barSize) * 3.6
      pendingHueRef.current = newHue
      displayHueRef.current = newHue
      window.dispatchEvent(
        new CustomEvent('rbgcp-hue-preview', {
          detail: { hue: newHue, pickerIdSuffix },
        })
      )

      if (handleRef.current) {
        handleRef.current.style.left = `${newHue * ((squareWidth - 18) / 360)}px`
      }

      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null
          const hue = pendingHueRef.current
          if (hue === null) return

          const currentHc = hcRef.current
          const tinyHsv = tinycolor({
            h: hue,
            s: currentHc?.s,
            v: currentHc?.v,
          })
          const { r, g, b } = tinyHsv.toRgb()
          handleChangeRef.current(`rgba(${r}, ${g}, ${b}, ${currentHc.a})`)
        })
      }
    }
  }

  const handleMove = (e: any) => {
    if (draggingRef.current) {
      didDragRef.current = true
      handleHue(e.clientX)
    }
  }

  const handleClick = (e: any) => {
    if (!didDragRef.current) {
      handleHue(e.clientX)
    }
    didDragRef.current = false
  }

  useEffect(() => {
    const handleUp = () => {
      const hue = pendingHueRef.current
      const currentHc = hcRef.current
      if (hue !== null && currentHc?.s === 0) {
        setHc({ ...currentHc, h: hue })
      }
      draggingRef.current = false
    }

    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointermove', handleMove)

    return () => {
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointermove', handleMove)
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [pickerIdSuffix, setHc])

  return (
    <div
      style={{
        height: 14,
        marginTop: 17,
        marginBottom: 4,
        cursor: 'ew-resize',
        position: 'relative',
        touchAction: 'none',
      }}
      ref={hueRef}
      onPointerDown={handleDown}
      id={`rbgcp-hue-wrap${pickerIdSuffix}`}
      // className="rbgcp-hue-wrap"
    >
      <div
        tabIndex={0}
        role="button"
        // className="rbgcp-handle rbgcp-handle-hue"
        style={{
          border: '2px solid white',
          borderRadius: '50%',
          boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.5)',
          width: '18px',
          height: '18px',
          zIndex: 1000,
          position: 'absolute',
          left: displayHueRef.current * ((squareWidth - 18) / 360),
          top: -2,
          cursor: 'ew-resize',
          boxSizing: 'border-box',
        }}
        id={`rbgcp-hue-handle${pickerIdSuffix}`}
      />
      <canvas
        ref={barRef}
        height="14px"
        // className="rbgcp-hue-bar"
        width={`${squareWidth}px`}
        onClick={(e) => handleClick(e)}
        id={`rbgcp-hue-bar${pickerIdSuffix}`}
        style={{
          borderRadius: 14,
          position: 'relative',
          verticalAlign: 'top',
        }}
      />
    </div>
  )
}

export default Hue
