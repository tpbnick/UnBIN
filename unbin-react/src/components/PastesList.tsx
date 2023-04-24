import React, { useState, useEffect, useContext } from "react"
import { ThemeContext } from "./ThemeContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faTimes } from "@fortawesome/free-solid-svg-icons"

const API_BASE_URL = "http://localhost:3000"

export interface Paste {
  id: number
  text: string
  title: string
  date: string
}

interface PastesListProps {
  currentPaste?: Paste | null
  onPasteClick?: (paste: Paste) => void
  onPasteUpdated?: () => void
  refreshPastes?: boolean
  onCreateClick?: () => void
  showToastSuccess?: (message: string) => void
  showToastFailure?: (message: string) => void
  onPasteDeleted?: (id: number) => void
  isMobileScreen?: boolean
}

export async function fetchPastes(apiKey: string): Promise<Paste[]> {
  const response = await fetch(`${API_BASE_URL}/pastes`, {
    headers: {
      "x-api-key": apiKey,
    },
  })
  const data = await response.json()
  return data.reverse()
}

const PastesList: React.FC<PastesListProps> = ({
  currentPaste,
  onPasteClick,
  onPasteUpdated,
  refreshPastes,
  onCreateClick,
  showToastSuccess,
  showToastFailure,
  onPasteDeleted,
  isMobileScreen,
}) => {
  const { theme } = useContext(ThemeContext)
  const [pastes, setPastes] = useState<Paste[]>([])
  const [apiKey, setApiKey] = useState("")
  const [searchText, setSearchText] = useState("")
  const [sortOrder, setSortOrder] = useState<"old" | "new">("new")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pasteToDelete, setPasteToDelete] = useState<number | null>(null)

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

  useEffect(() => {
    if (apiKey) {
      fetchPastes(apiKey).then((data) => setPastes(data))
    }
  }, [apiKey])

  useEffect(() => {
    if (apiKey && refreshPastes !== undefined) {
      fetchPastes(apiKey).then((data) => setPastes(data))
    }
  }, [apiKey, refreshPastes])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${month}-${day}-${year}`
  }

  const handleOpenDeleteModal = (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setPasteToDelete(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDeleteClick = async () => {
    if (pasteToDelete !== null) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/delete-paste/${pasteToDelete}`,
          {
            method: "DELETE",
            headers: {
              "x-api-key": apiKey,
            },
          }
        )

        if (response.ok) {
          const remainingPastes = pastes.filter(
            (paste) => paste.id !== pasteToDelete
          )
          setPastes(remainingPastes)
          if (onPasteDeleted) {
            onPasteDeleted(pasteToDelete)
          }
          if (showToastSuccess) {
            showToastSuccess("Paste deleted successfully!")
          }
          if (currentPaste && currentPaste.id === pasteToDelete && onPasteDeleted) {
            onPasteDeleted(pasteToDelete)
          }
        } else {
          if (showToastFailure) {
            showToastFailure(`Error deleting paste: ${response.statusText}`)
          }
        }
      } catch (error) {
        if (showToastFailure) {
          showToastFailure("Error deleting paste! API is unreachable.")
        }
      }
    }

    // Close the delete modal
    setShowDeleteModal(false)
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleDropdownItemClick = (value: "old" | "new") => {
    setSortOrder(value)
    setShowDropdown(false)
  }

  const handleSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const filteredPastes = pastes
    .filter((paste) => paste.title.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "old"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    )

  return (
    <div>
      <div
        className={`${
          isMobileScreen
            ? "search-create-container"
            : "searchAndSort flex justify-between items-center pb-4"
        }`}
      >
        <div className={`flex items-center${isMobileScreen ? " mb-2" : ""}`}>
          <input
            type="text"
            placeholder="Search pastes..."
            value={searchText}
            onChange={handleSearchTextChange}
            className="input input-bordered w-full max-w-xs bg-white"
          />
          {searchText && (
            <button className="btn ml-2" onClick={() => setSearchText("")}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        {isMobileScreen && (
          <div className="create-filter flex justify-between items-center w-full pb-4">
            <button className="btn m-1 btn-success" onClick={onCreateClick}>
              Create
            </button>
            <div className="dropdown relative inline-block">
              <button
                tabIndex={0}
                className="btn m-1 btn-success"
                onClick={toggleDropdown}
              >
                {sortOrder === "new" ? "Newest first" : "Oldest first"}
              </button>
              {showDropdown && (
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 absolute"
                >
                  <li>
                    <button
                      onClick={() => handleDropdownItemClick("new")}
                      className="w-full text-left"
                    >
                      Newest first
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleDropdownItemClick("old")}
                      className="w-full text-left"
                    >
                      Oldest first
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}
        {!isMobileScreen && (
          <div className="flex items-center">
            <button className="btn m-1 btn-success" onClick={onCreateClick}>
              Create
            </button>
            <div className="dropdown relative inline-block">
              <button
                tabIndex={0}
                className="btn m-1 btn-success"
                onClick={toggleDropdown}
              >
                {sortOrder === "new" ? "Newest first" : "Oldest first"}
              </button>
              {showDropdown && (
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52 absolute"
                >
                  <li>
                    <button
                      onClick={() => handleDropdownItemClick("new")}
                      className="w-full text-left"
                    >
                      Newest first
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleDropdownItemClick("old")}
                      className="w-full text-left"
                    >
                      Oldest first
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      <ul className="pastes-list">
        {filteredPastes.map((paste) => (
          <li
            className={`pastes-list-item border-2 ${
              currentPaste && currentPaste.id === paste.id
                ? "border-gray-700"
                : "border-transparent"
            } bg-white`}
            key={paste.id}
            onClick={() => onPasteClick && onPasteClick(paste)}
          >
            <div
              className={`pastes-list-item-bg bg-${
                theme === "light" ? "light" : "dark"
              }`}
            ></div>
            <div className="pastes-list-item-text">{paste.title}</div>
            <div className="pastes-list-item-date">{formatDate(paste.date)}</div>
            <FontAwesomeIcon
              icon={faTrash}
              className="text-red-500 hover:text-red-700 cursor-pointer mr-2 ml-2"
              onClick={(event) => handleOpenDeleteModal(paste.id, event)}
            />
          </li>
        ))}
      </ul>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h2 className="text-xl mb-4 text-center pt-3">
                Are you sure you want to delete paste:
                <br />
                <span className="font-bold">
                  {" "}
                  {pastes.find((paste) => paste.id === pasteToDelete)?.title}
                </span>
              </h2>
              <div className="modal-action pt-2">
                <button onClick={() => setShowDeleteModal(false)} className="btn">
                  Cancel
                </button>
                <button onClick={handleConfirmDeleteClick} className="btn btn-error">
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PastesList
