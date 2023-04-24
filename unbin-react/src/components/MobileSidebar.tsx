import React, { useRef, useEffect } from "react"

interface MobileSidebarProps {
  show: boolean
  onClose: () => void
  children: React.ReactNode
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  show,
  onClose,
  children,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        show &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose, show])

  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transition duration-300 transform p-2 ${
        show ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {children}
    </div>
  )
}

export default MobileSidebar
