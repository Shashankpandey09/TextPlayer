// src/TextEditor.js
import React, { useState, useRef } from 'react'
import './TextEditor.css'

const TextEditor = () => {
  const [textElements, setTextElements] = useState([])
  const [currentText, setCurrentText] = useState('')
  const [history, setHistory] = useState({
    past: [],
    present: textElements,
    future: [],
  })
  const [selectedElement, setSelectedElement] = useState(null)
  const [fontSize, setFontSize] = useState('14px')
  const [fontColor, setFontColor] = useState('#000000')
  const [fontFamily, setFontFamily] = useState('Times New Roman')
//   const [textAlign, setTextAlign] = useState('left')
  const canvasRef = useRef()

  const handleAddText = () => {
    if (currentText.trim() !== '') {
      const newElement = {
        id: Date.now(),
        text: currentText,
        position: { top: 0, left: 0 },
        style: { fontSize, color: fontColor, fontFamily },
      }
      const newHistory = {
        past: [...history.past, history.present],
        present: [...history.present, newElement],
        future: [],
      }
      setTextElements(newHistory.present)
      setHistory(newHistory)
      setCurrentText('')
    }
  }

  const handleModifyText = (id, newText) => {
    setTextElements((prevElements) =>
      prevElements.map((element) =>
        element.id === id ? { ...element, text: newText } : element
      )
    )
    setHistory((prevHistory) => ({
      past: [...prevHistory.past, prevHistory.present],
      present: textElements.map((element) =>
        element.id === id ? { ...element, text: newText } : element
      ),
      future: [],
    }))
  }

  const handleMoveText = (id, newPosition) => {
    setTextElements((prevElements) =>
      prevElements.map((element) =>
        element.id === id ? { ...element, position: newPosition } : element
      )
    )
    setHistory((prevHistory) => ({
      past: [...prevHistory.past, prevHistory.present],
      present: textElements.map((element) =>
        element.id === id ? { ...element, position: newPosition } : element
      ),
      future: [],
    }))
  }

  const handleUndo = () => {
    if (history.past.length > 0) {
      const previousHistory = {
        past: history.past.slice(0, -1),
        present: history.past[history.past.length - 1],
        future: [history.present, ...history.future],
      }
      setTextElements(previousHistory.present)
      setHistory(previousHistory)
      setSelectedElement(null)
    }
  }

  const handleRedo = () => {
    if (history.future.length > 0) {
      const nextHistory = {
        past: [...history.past, history.present],
        present: history.future[0],
        future: history.future.slice(1),
      }
      setTextElements(nextHistory.present)
      setHistory(nextHistory)
      setSelectedElement(null)
    }
  }

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id.toString())
    setSelectedElement(id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'), 10)
    const draggedElement = textElements.find(
      (element) => element.id === draggedId
    )

    if (draggedElement) {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const newPosition = {
        top: e.clientY - canvasRect.top,
        left: e.clientX - canvasRect.left,
      }
      handleMoveText(draggedId, newPosition)
    }
  }

const handleTextModify = (property, value) => {
  if (selectedElement !== null) {
    setTextElements((prevElements) =>
      prevElements.map((element) =>
        element.id === selectedElement
          ? {
              ...element,
              style: {
                ...element.style,
                [property]: value,
              },
            }
          : element
      )
    )
    setHistory((prevHistory) => ({
      past: [...prevHistory.past, prevHistory.present],
      present: textElements.map((element) =>
        element.id === selectedElement
          ? {
              ...element,
              style: {
                ...element.style,
                [property]: value,
              },
            }
          : element
      ),
      future: [],
    }))
  }
}


  return (
    <div className="text-editor">
      <div className="toolbar">
        <input
          type="text"
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
        />
        <button onClick={handleAddText}>Add Text</button>
        <button onClick={handleUndo} disabled={history.past.length === 0}>
          Undo
        </button>
        <button onClick={handleRedo} disabled={history.future.length === 0}>
          Redo
        </button>
        <label htmlFor="fontSize">Font Size:</label>
        <select
          id="fontSize"
          onChange={(e) => setFontSize(e.target.value)}
          value={fontSize}
        >
          <option value="15px">15px</option>
          <option value="25px">25px</option>
          <option value="50px">50px</option>
          <option value="100px">100px</option>
          <option value="150px">150px</option>
          <option value="200px">200px</option>
        </select>

        <label htmlFor="fontFamily">Font Family:</label>
        <select
          id="fontFamily"
          onChange={(e) => setFontFamily(e.target.value)}
          value={fontFamily}
        >
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Impact">Impact</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Palatino">Palatino</option>
          <option value="Lucida Console">Lucida Console</option>
          <option value="Cursive">Cursive</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Monospace">Monospace</option>
          <option value="Brush Script MT">Brush Script MT</option>
          <option value="Copperplate">Copperplate</option>
          <option value="Garamond">Garamond</option>
        </select>

        <label htmlFor="color">Font Color:</label>
        <input
          type="color"
          id="color"
          onChange={(e) => setFontColor(e.target.value)}
          value={fontColor}
        />
      </div>
      <div
        className="canvas"
        ref={canvasRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {textElements.map((element) => (
          <div
            key={element.id}
            className="text-element"
            style={{ ...element.position, ...element.style }}
            contentEditable
            onBlur={(e) => {
              handleModifyText(element.id, e.target.textContent)
              handleTextModify('text', e.target.textContent)
            }}
            onDragStart={(e) => handleDragStart(e, element.id)}
            draggable
          >
            {element.text}
          </div>
        ))}
      </div>
      <div className="note">
        <p>
          🌟 <strong style={{ textDecoration: 'underline' }}>Note:</strong>{' '}
          Please check the RGB/HSL/HEX value when selecting color for text.🌟
        </p>
        <p>
          Made with love by <strong>Shashank</strong> ❤️
        </p>
      </div>
    </div>
  )
}

export default TextEditor
