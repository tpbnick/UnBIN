import React, { useState } from "react"
import "../App.css"
import "../markdown-editor.css"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import remarkEmoji from "remark-emoji"

interface Props {
  pasteId: number
  title: string
  text: string
  date: string
  isMobileScreen: boolean
  onSave: (updatedTitle: string, updatedText: string) => void
  onClose?: () => void
}

const PasteEditor: React.FC<Props> = ({
  pasteId,
  title,
  text,
  date,
  onSave,
  onClose,
  isMobileScreen,
}) => {
  const [updatedText, setUpdatedText] = useState(text)
  const [updatedTitle, setUpdatedTitle] = useState(title)
  const [editMode, setEditMode] = useState(false)

  const handleSave = () => {
    onSave(updatedTitle, updatedText)
    setEditMode(false)
    if (onClose) {
      onClose()
    }
  }

  const toggleEditMode = () => {
    setEditMode(!editMode) // Toggle editMode
  }

  return (
    <div className="paste-editor-container paste-editor-full-width">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          {editMode ? (
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className="title-input input input-bordered flex-grow bg-white text-black text-2xl"
            />
          ) : (
            <span className="text-3xl py-4">{updatedTitle}</span>
          )}
        </div>
        <h2 className="mr-2 pl-4">Paste ID: {pasteId}</h2>
      </div>
      {editMode ? (
        <textarea
          className={`w-full border border-gray-400 p-2 mb-2 input input-bordered bg-white text-black ${
            isMobileScreen ? "h-[90vh] min-h-[50vh]" : "h-[75vh] min-h-[50vh]"
          }`}
          value={updatedText}
          onChange={(e) => setUpdatedText(e.target.value)}
        />
      ) : (
        <div
          className={`markdown-container overflow-y-auto border rounded-lg border-gray-700 p-2 mb-2 bg-white ${
            isMobileScreen ? "h-[90vh] min-h-[50vh]" : "h-[75vh] min-h-[50vh]"
          }`}
        >
          <ReactMarkdown
            className="react-markdown w-full p-2 mb-2 bg-white markdown-editor"
            remarkPlugins={[remarkGfm, remarkEmoji]}
            rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSanitize]}
          >
            {updatedText}
          </ReactMarkdown>
        </div>
      )}
      <div className="text-right">
        <button
          className={`btn m-1 ${editMode ? "btn-error" : "btn-success"}`}
          onClick={toggleEditMode}
        >
          {editMode ? "Cancel" : "Edit"}
        </button>
        {editMode && (
          <button className="btn m-1 btn-success" onClick={handleSave}>
            Save
          </button>
        )}
      </div>
    </div>
  )
}

export default PasteEditor
