import React, { useState } from "react"
import { FaCog, FaBars } from "react-icons/fa"
import { Link } from "react-router-dom"
import SettingsModal from "./SettingsModal"
import { useMediaQuery } from "react-responsive"

interface Props {
  title: string
  onShowSettings: () => void
  onToggleSidebar: () => void
  showSidebar: boolean
}

const NavBar: React.FC<Props> = ({
  title,
  onShowSettings,
  onToggleSidebar,
  showSidebar,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const isMobileScreen = useMediaQuery({ query: "(max-width: 768px)" })

  const handleSettingsClick = () => {
    setShowSettingsModal(true)
  }

  const handleCloseModal = () => {
    setShowSettingsModal(false)
  }

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        {isMobileScreen && (
          <button
            className="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-white hover:border-white mr-2"
            onClick={() => {
              if (!showSidebar) onToggleSidebar()
            }}
          >
            <FaBars />
          </button>
        )}
        <Link to="/" className="flex items-center">
          <img src="/images/unbin-logo8.png" alt="UnBIN Logo" className="h-8 mr-2" />
          <span className="font-semibold text-xl tracking-tight">{title}</span>
        </Link>
      </div>
      {isMobileScreen && (
        <button
          className="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-white hover:border-white"
          onClick={onShowSettings}
        >
          <FaCog className="mr-2" />
          Settings
        </button>
      )}
      {!isMobileScreen && (
        <button
          className="flex items-center px-3 py-2 border rounded text-gray-500 border-gray-600 hover:text-white hover:border-white"
          onClick={handleSettingsClick}
        >
          <FaCog className="mr-2" />
          Settings
        </button>
      )}
      {showSettingsModal && <SettingsModal onClose={handleCloseModal} />}
    </nav>
  )
}

export default NavBar
