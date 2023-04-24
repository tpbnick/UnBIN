import React, { useState } from "react"
import "../App.css"

interface Props {
  title: string
  text: string
  onSave: (updatedTitle: string, updatedText: string) => Promise<void>
  onClose?: () => void
}

const PasteCreator: React.FC<Props> = ({ title, text, onSave, onClose }) => {
  const [updatedText, setUpdatedText] = useState(text)
  const [updatedTitle, setUpdatedTitle] = useState(title)

  const handleSave = async () => {
    await onSave(updatedTitle, updatedText)
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="paste-editor-container">
      <div className="flex items-center mb-2">
        <input
          type="text"
          value={updatedTitle}
          placeholder="Enter Paste Title..."
          onChange={(e) => setUpdatedTitle(e.target.value)}
          className="title-input input input-bordered flex-grow bg-white"
        />
      </div>
      <textarea
        className="w-full h-64 border border-gray-400 max-h-[50vh] min-h-[50vh] p-2 mb-2 input input-bordered bg-white"
        value={updatedText}
        onChange={(e) => setUpdatedText(e.target.value)}
      />
      <div className="text-right">
        <button className="btn m-1 btn-success" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  )
}

export default PasteCreator
