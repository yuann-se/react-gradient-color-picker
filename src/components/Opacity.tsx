/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { usePicker } from '../context.js'
import { getHandleValue } from '../utils/utils.js'

const Opacity = () => {
  const {
    config,
    hc = {},
    squareWidth,
    handleChange,
    defaultStyles,
    pickerIdSuffix,
    startInteraction,
  } = usePicker()
  const { r, g, b } = hc
  const bg = `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(${r},${g},${b},.5) 100%)`
  const { barSize } = config
  const left = squareWidth - 18

  const opacityRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const didDragRef = useRef(false)
  const pendingOpacityRef = useRef<number | null>(null)
  const displayOpacityRef = useRef(hc?.a ?? 0)
  const frameRef = useRef<number | null>(null)
  const boundsRef = useRef<DOMRect | null>(null)
  const hcRef = useRef(hc)
  const handleChangeRef = useRef(handleChange)

  useEffect(() => {
    hcRef.current = hc
    handleChangeRef.current = handleChange
  }, [hc, handleChange])

  useLayoutEffect(() => {
    if (!draggingRef.current) {
      displayOpacityRef.current = hc?.a ?? 0
      if (handleRef.current) {
        handleRef.current.style.left = `${left * displayOpacityRef.current}px`
      }
    }
  }, [hc?.a, left])

  const handleDown = () => {
    startInteraction()
    draggingRef.current = true
    didDragRef.current = false
    boundsRef.current =
      opacityRef.current?.parentElement?.getBoundingClientRect() ?? null
  }

  const commitOpacity = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    const opacity = pendingOpacityRef.current
    if (opacity === null) return

    const currentHc = hcRef.current
    handleChangeRef.current(
      `rgba(${currentHc.r}, ${currentHc.g}, ${currentHc.b}, ${opacity})`
    )
    pendingOpacityRef.current = null
  }

  const handleOpacity = (x: number) => {
    if (opacityRef.current) {
      const bounds = boundsRef.current
      const newO = bounds
        ? Math.round(
            Math.max(
              0,
              Math.min(x - bounds.x - barSize / 2, bounds.width - 18)
            ) /
              ((bounds.width - 18) / 100)
          ) / 100
        : getHandleValue(x, opacityRef.current, barSize) / 100
      pendingOpacityRef.current = newO
      displayOpacityRef.current = newO

      if (handleRef.current) {
        handleRef.current.style.left = `${left * newO}px`
      }

      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null
          commitOpacity()
        })
      }
    }
  }

  const handleMove = (e: any) => {
    if (draggingRef.current) {
      didDragRef.current = true
      handleOpacity(e.clientX)
    }
  }

  const handleClick = (e: any) => {
    if (!didDragRef.current) {
      handleOpacity(e.clientX)
      commitOpacity()
    }
    didDragRef.current = false
  }

  useEffect(() => {
    const handleUp = () => {
      if (draggingRef.current) {
        commitOpacity()
      }
      draggingRef.current = false
      boundsRef.current = null
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
  }, [])

  return (
    <div
      onPointerDown={handleDown}
      style={{
        height: 14,
        marginTop: 17,
        marginBottom: 4,
        cursor: 'ew-resize',
        position: 'relative',
        touchAction: 'none',
      }}
      id={`rbgcp-opacity-wrapper${pickerIdSuffix}`}
      // className="rbgcp-opacity-wrap"
    >
      <div
        // className="rbgcp-opacity-checkered"
        id={`rbgcp-opacity-checkered-bg${pickerIdSuffix}`}
        style={{ ...defaultStyles.rbgcpCheckered, width: '100%', height: 14 }}
      />
      <div
        // className="rbgcp-handle rbgcp-handle-opacity"
        id={`rbgcp-opacity-handle${pickerIdSuffix}`}
        ref={handleRef}
        style={{
          ...defaultStyles.rbgcpHandle,
          left: left * displayOpacityRef.current,
          top: -2,
          transition: 'none',
        }}
      />
      <div
        ref={opacityRef}
        style={{ ...defaultStyles.rbgcpOpacityOverlay, background: bg }}
        id={`rbgcp-opacity-overlay${pickerIdSuffix}`}
        // className="rbgcp-opacity-overlay"
        onClick={(e) => handleClick(e)}
      />
    </div>
  )
}

export default Opacity
