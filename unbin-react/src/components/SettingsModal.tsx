import React, { useState, useEffect, useContext } from "react"
import { ThemeContext, ThemeContextType } from "./ThemeContext"
import toast from "react-hot-toast"

interface Props {
  onClose: () => void
}

const SettingsModal: React.FC<Props> = ({ onClose }) => {
  const { theme, toggleTheme } = useContext<ThemeContextType>(ThemeContext)
  const [apiKey, setApiKey] = useState<string>("")
  const [apiKeyVisible, setApiKeyVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const fetchApiKey = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3000/apikey")
      const data = await response.json()
      setApiKey(data.apiKey)
    } catch (error) {
      console.error("Error fetching API key:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKey()
  }, [])

  const handleThemeToggle = () => {
    toggleTheme()
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setIsCopied(true)
    notify("copy_api")
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const notify = (notification_type: string) => {
    if (notification_type === "copy_api") {
      toast.success("API Key Copied!")
      console.log("trying to toast")
    } else {
      toast.error("Error!")
    }
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      {isCopied}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        ></span>

        <div
          className={`inline-block align-bottom ${
            theme === "light" ? "bg-white" : "bg-slate-800"
          } rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
        >
          <div
            className={`${
              theme === "light"
                ? "bg-white text-gray-900"
                : "bg-slate-800 text-gray-100"
            } px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}
          >
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className={`text-xl leading-6 font-medium ${
                    theme === "light" ? "text-gray-900" : "text-gray-100"
                  } mb-2 pb-2`}
                >
                  Settings
                </h3>
                <div className="mt-2">
                  <div className="mb-4">
                    <label className="mr-2">Current Theme:</label>
                    <button
                      onClick={handleThemeToggle}
                      className="border border-gray-500 rounded px-2 py-1"
                    >
                      {theme === "light" ? "Light" : "Dark"}
                    </button>
                  </div>
                  <div className="mb-4">
                    <label className="mr-2">API Key:</label>
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span className="border border-gray-500 rounded px-2 py-1">
                          {apiKeyVisible ? apiKey : "••••••••••••"}
                        </span>
                        <button
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                          className="ml-2 border border-gray-500 rounded px-2 py-1"
                        >
                          {apiKeyVisible ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={handleCopyApiKey}
                          className="ml-2 border border-gray-500 rounded px-2 py-1"
                        >
                          Copy
                        </button>
                        <a
                          href={`http://localhost:3000/api-docs`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 link"
                        >
                          View API Docs
                        </a>
                      </>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="mr-2">
                      <a
                        href="https://www.markdownguide.org/cheat-sheet"
                        target="_blank"
                        rel="noReferrer"
                        className="link"
                      >
                        Markdown Cheatsheet
                      </a>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="mr-2">Version:</label>
                    <span>0.1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${
              theme === "light" ? "bg-gray-200" : "bg-gray-700"
            } px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}
          >
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
