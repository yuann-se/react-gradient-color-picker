import { computePickerPosition, computeSquareXY } from '../utils/utils.js'
import React, { useRef, useState, useEffect } from 'react'
import usePaintSquare from '../hooks/usePaintSquare.js'
import { usePicker } from '../context.js'
import tinycolor from 'tinycolor2'

const Square = () => {
  const {
    hc,
    config,
    squareWidth,
    squareHeight,
    handleChange,
    defaultStyles,
    pickerIdSuffix,
    startInteraction,
  } = usePicker()
  const { crossSize } = config
  const [dragging, setDragging] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [squareHue, setSquareHue] = useState(hc?.h ?? 0)
  const squareHueRef = useRef(hc?.h ?? 0)
  const [x, y] = computeSquareXY(
    hc?.s,
    hc?.v * 100,
    squareWidth,
    squareHeight,
    crossSize
  )
  const [dragPos, setDragPos] = useState({ x, y })
  const squareRef = useRef<HTMLDivElement>(null)

  usePaintSquare(canvas, squareHue, squareWidth, squareHeight)

  useEffect(() => {
    const handleHuePreview = (event: Event) => {
      const customEvent = event as CustomEvent<{
        hue: number
        pickerIdSuffix: string
      }>
      if (customEvent.detail.pickerIdSuffix === pickerIdSuffix) {
        squareHueRef.current = customEvent.detail.hue
        setSquareHue(customEvent.detail.hue)
      }
    }

    window.addEventListener('rbgcp-hue-preview', handleHuePreview)
    return () => {
      window.removeEventListener('rbgcp-hue-preview', handleHuePreview)
    }
  }, [pickerIdSuffix])

  useEffect(() => {
    if (!dragging) {
      squareHueRef.current = hc?.h ?? 0
      setSquareHue(hc?.h ?? 0)
    }
  }, [dragging, hc?.h])

  useEffect(() => {
    if (!dragging) {
      setDragPos({ x: hc?.v === 0 ? dragPos.x : x, y })
    }
  }, [hc?.h, hc?.v, x, y])

  useEffect(() => {
    const handleUp = () => {
      stopDragging()
    }

    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointermove', handleMove)

    return () => {
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointermove', handleMove)
    }
  }, [dragging])

  useEffect(() => {
    if (dragging) {
      handleColor()
    }
  }, [dragPos.x, dragPos.y, dragging])

  const handleColor = () => {
    const { x, y } = dragPos

    if (x == null || y == null || isNaN(x) || isNaN(y)) return

    // Map the handle centre to the full [0, squareWidth] / [0, squareHeight]
    // range so the corners are reachable (e.g. S=0, V=100 => pure white).
    // crossSize / 2 keeps this consistent with computeSquareXY (the inverse).
    const x1 = Math.max(0, Math.min(x + crossSize / 2, squareWidth))
    const y1 = Math.max(0, Math.min(y + crossSize / 2, squareHeight))
    const newS = (x1 / squareWidth) * 100
    const newY = 100 - (y1 / squareHeight) * 100
    const updated = tinycolor(
      `hsva(${squareHueRef.current}, ${newS}%, ${newY}%, ${hc?.a})`
    )
    handleChange(updated.toRgbString())
  }

  const setComputedDragPos = (e: any) => {
    if (squareRef.current) {
      const [x, y] = computePickerPosition(e, squareRef.current, crossSize)
      setDragPos({ x, y })
    }
  }

  const stopDragging = () => {
    setDragging(false)
  }

  const handleMove = (e: any) => {
    if (dragging) {
      setComputedDragPos(e)
    }
  }

  const handleClick = (e: any) => {
    if (!dragging) {
      setComputedDragPos(e)
    }
  }

  const handleMouseDown = () => {
    startInteraction()
    setDragging(true)
  }

  const handleCanvasDown = (e: any) => {
    startInteraction()
    setDragging(true)
    setComputedDragPos(e)
  }

  return (
    <div
      style={{ position: 'relative', marginBottom: 12 }}
      id={`rbgcp-square-wrapper${pickerIdSuffix}`}
    >
      <div
        onPointerDown={handleCanvasDown}
        id={`rbgcp-square${pickerIdSuffix}`}
        ref={squareRef}
        style={{
          position: 'relative',
          cursor: 'ew-cross',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            ...defaultStyles.rbgcpHandle,
            transform: `translate(${dragPos?.x ?? 0}px, ${dragPos?.y ?? 0}px)`,
            touchAction: 'none',
            ...(dragging ? { transition: '' } : {}),
          }}
          onPointerDown={handleMouseDown}
          id={`rbgcp-square-handle${pickerIdSuffix}`}
        />
        <div
          style={{ ...defaultStyles.rbgcpCanvasWrapper, height: squareHeight }}
          id={`rbgcp-square-canvas-wrapper${pickerIdSuffix}`}
          onClick={(e) => handleClick(e)}
        >
          <canvas
            ref={canvas}
            width={`${squareWidth}px`}
            height={`${squareHeight}px`}
            id={`rbgcp-square-canvas${pickerIdSuffix}`}
          />
        </div>
      </div>
    </div>
  )
}

export default Square
