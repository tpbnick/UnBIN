import React, { useState, useContext, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { useMediaQuery } from "react-responsive"
import toast, { Toaster } from "react-hot-toast"
import {
  ThemeContext,
  ThemeContextType,
  ThemeProvider,
} from "./components/ThemeContext"
import Navbar from "./components/NavBar"
import PastesList, { Paste, fetchPastes } from "./components/PastesList"
import SettingsModal from "./components/SettingsModal"
import PasteEditor from "./components/PasteEditor"
import PasteCreator from "./components/PasteCreator"
import MobileSidebar from "./components/MobileSidebar"
import "./App.css"

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false)
  const { theme, toggleTheme } = useContext<ThemeContextType>(ThemeContext)
  const [currentPaste, setCurrentPaste] = useState<Paste | null>(null)
  const [pastes, setPastes] = useState<Paste[]>([])
  const [apiKey, setApiKey] = useState("")
  const [refreshPastes, setRefreshPastes] = useState(false)
  const [showCreator, setShowCreator] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const isMobileScreen = useMediaQuery({ query: "(max-width: 768px)" })
  const API_BASE_URL = "http://localhost:3000"
  console.log(API_BASE_URL)

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const showToastSuccess = (message: string) => {
    toast.success(message)
  }

  const showToastError = (message: string) => {
    toast.error(message)
  }

  const handleShowSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handlePasteDeleted = (deletedPasteId: number) => {
    if (currentPaste && currentPaste.id === deletedPasteId) {
      setCurrentPaste(null)
    }
  }

  useEffect(() => {
    async function fetchApiKey() {
      if (apiKey !== "") {
        return
      }

      const response = await fetch(`${API_BASE_URL}/apikey`)
      const data = await response.json()
      setApiKey(data.apiKey)
    }

    fetchApiKey()
  }, [])

  const handleCreateClick = () => {
    setCurrentPaste(null)
    setShowCreator(true)
  }

  useEffect(() => {
    if (apiKey) {
      fetchPastes(apiKey).then(setPastes)
    }
  }, [apiKey])

  const savePaste = async (
    id: number,
    updatedTitle: string,
    updatedText: string
  ): Promise<boolean> => {
    try {
      const endpoint = id === 0 ? "/create-paste" : `/update-paste/${id}`
      const method = id === 0 ? "POST" : "PUT"

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ title: updatedTitle, text: updatedText }),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to ${id === 0 ? "create" : "update"} paste: ${response.statusText}`
        )
      }

      // Show success notification
      toast.success(`Paste ${id === 0 ? "created" : "updated"} successfully!`)

      // Refresh the list of pastes
      if (apiKey) {
        fetchPastes(apiKey).then(setPastes)
      }
      setRefreshPastes(!refreshPastes)
      return true
    } catch (error) {
      // Show error notification
      toast.error(
        `Error ${id === 0 ? "creating" : "updating"} paste: ${
          (error as Error).message
        }`
      )
      return false
    }
  }

  return (
    <ThemeProvider>
      <Router>
        <div
          className={`App min-h-screen ${
            theme === "light" ? "bg-custom-light" : "bg-custom-dark"
          }`}
        >
          <Navbar
            title="UnBIN"
            onShowSettings={handleShowSettings}
            onToggleSidebar={handleToggleSidebar}
            showSidebar={showSidebar}
          />
          {isMobileScreen && (
            <MobileSidebar show={showSidebar} onClose={handleToggleSidebar}>
              <PastesList
                currentPaste={currentPaste}
                onPasteClick={setCurrentPaste}
                onPasteUpdated={() => {
                  if (apiKey) {
                    fetchPastes(apiKey).then(setPastes)
                  }
                }}
                refreshPastes={refreshPastes}
                onCreateClick={handleCreateClick}
                showToastSuccess={showToastSuccess}
                showToastFailure={showToastError}
                onPasteDeleted={handlePasteDeleted}
                isMobileScreen={isMobileScreen}
              />
            </MobileSidebar>
          )}
          <Toaster position="top-center" />
          {showSettings && <SettingsModal onClose={handleCloseSettings} />}
          <div className="container mx-auto mt-4">
            <div
              className={`grid gap-4 ${
                isMobileScreen ? "grid-cols-1" : "grid-cols-3"
              }`}
            >
              {" "}
              {!isMobileScreen && (
                <div className="col-span-1">
                  <PastesList
                    currentPaste={currentPaste}
                    onPasteClick={setCurrentPaste}
                    onPasteUpdated={() => {
                      if (apiKey) {
                        fetchPastes(apiKey).then(setPastes)
                      }
                    }}
                    refreshPastes={refreshPastes}
                    onCreateClick={handleCreateClick}
                    showToastSuccess={showToastSuccess}
                    showToastFailure={showToastError}
                    onPasteDeleted={handlePasteDeleted}
                  />
                </div>
              )}
              <div
                className={`col-span-2 ${
                  isMobileScreen ? "mobile-paste-editor" : ""
                }`}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      currentPaste ? (
                        <PasteEditor
                          key={currentPaste.id}
                          pasteId={currentPaste.id}
                          text={currentPaste.text}
                          title={currentPaste.title}
                          date={currentPaste.date}
                          isMobileScreen={isMobileScreen}
                          onSave={async (updatedTitle, updatedText) => {
                            await savePaste(
                              currentPaste.id,
                              updatedTitle,
                              updatedText
                            )
                          }}
                        />
                      ) : showCreator ? (
                        <PasteCreator
                          title=""
                          text=""
                          onSave={async (updatedTitle, updatedText) => {
                            const success = await savePaste(
                              0,
                              updatedTitle,
                              updatedText
                            )
                            if (success) {
                              setShowCreator(false)
                              const response = await fetch("/pastes", {
                                headers: {
                                  "x-api-key": apiKey,
                                },
                              })
                              const data = await response.json()
                              setCurrentPaste(data[data.length - 1])
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-2xl">
                            Select a paste or
                            <button
                              className="btn m-1 btn-success inline-block ml-2"
                              onClick={handleCreateClick}
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      )
                    }
                  />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
