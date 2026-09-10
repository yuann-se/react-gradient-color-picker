import { useState } from 'react'
import ColorPicker from '@zdila/react-gradient-color-picker'

const solidStart = 'rgba(224, 91, 70, 1)'
const gradientWithAchromaticStart =
  'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(245,196,84,1) 100%)'
const gradientWithChromaticStart =
  'linear-gradient(90deg, RGBA(101, 224, 70, 1) 0%, rgba(69,132,245,1) 100%)'

function App() {
  const [value, setValue] = useState(gradientWithAchromaticStart)
  const [selectedGradient, setSelectedGradient] = useState<'a' | 'b' | null>(
    'a'
  )
  const [size, setSize] = useState(360)

  const setSolid = () => {
    setSelectedGradient(null)
    setValue(solidStart)
  }
  const setAchromaticGradient = () => {
    setSelectedGradient('a')
    setValue(gradientWithAchromaticStart)
  }
  const setChromaticGradient = () => {
    setSelectedGradient('b')
    setValue(gradientWithChromaticStart)
  }

  return (
    <main className="page-shell">
      <section className="intro">
        <p className="eyebrow">Local library playground</p>
        <h1>Gradient Color Picker</h1>
        <p className="lede">
          Edit files in <code>../src</code> and watch the component update here.
        </p>
      </section>

      <section className="workspace">
        <div className="picker-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live component</p>
              <h2>Try every interaction</h2>
            </div>
            <span className="status-dot">Watching</span>
          </div>
          <div className="picker-frame" style={{ width: size }}>
            <ColorPicker value={value} onChange={setValue} hideControls />
          </div>
        </div>

        <aside className="details-panel">
          <div className="control-group">
            <span className="label">Mode</span>
            <div className="segmented-control">
              <button
                className={!value.includes('gradient') ? 'active' : ''}
                onClick={setSolid}
              >
                Solid
              </button>
              <button
                className={selectedGradient === 'a' ? 'active' : ''}
                onClick={setAchromaticGradient}
              >
                Gradient A
              </button>
              <button
                className={selectedGradient === 'b' ? 'active' : ''}
                onClick={setChromaticGradient}
              >
                Gradient B
              </button>
            </div>
          </div>

          <label className="control-group" htmlFor="size">
            <span className="label">Picker width</span>
            <span className="range-value">{size}px</span>
            <input
              id="size"
              type="range"
              min="294"
              max="520"
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
            />
          </label>

          <div className="value-block">
            <span className="label">Current value</span>
            <code>{value}</code>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
