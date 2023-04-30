import React, { useState } from "react"
import classNames from "classnames"
import { NextRouter } from "next/router"
import { encodeShareCode } from "@/lib/shareCode"
import { TimeSlot } from "./timeSlot"
import { Program } from "./basalProgram"

export const Actions = ({
  router,
  timeSlots,
  programs,
  setIsSharing,
  isSharing,
  shareURL,
  share,
  setShowingShareSuccess,
  showingShareSuccess,
  addProgram,
  reset,
}: {
  router: NextRouter
  timeSlots: TimeSlot[]
  programs: Program[]
  setIsSharing: (isSharing: boolean) => void
  isSharing: boolean
  shareURL: string
  share: () => void
  setShowingShareSuccess: (showingShareSuccess: boolean) => void
  showingShareSuccess: boolean
  addProgram: () => void
  reset: () => void
}) => {
  const copyShareURL = () => {
    if (showingShareSuccess) {
      return
    }
    setShowingShareSuccess(true)
    navigator.clipboard.writeText(shareURL)
    setTimeout(() => {
      setShowingShareSuccess(false)
    }, 2500)
  }

  return (
    <>
      <div className="flex flex-wrap place-content-center">
        <button
          className="mx-4 rounded border-2 border-sky-400 px-4 py-2 text-center text-xl hover:bg-sky-400 hover:text-gray-800"
          onClick={(e) => share()}
        >
          Share
        </button>
        <button
          className="mx-4 rounded border-2 border-sky-400 px-4 py-2 text-center text-xl hover:bg-sky-400 hover:text-gray-800"
          onClick={(e) => reset()}
        >
          Start over
        </button>
      </div>

      {isSharing && (
        <div className="m-8 mx-auto w-96 rounded-lg bg-gray-800 p-8 text-center">
          <p>Copy the below URL to share your program.</p>
          <input
            type="text"
            value={shareURL}
            className="my-2 w-full rounded bg-sky-400 bg-opacity-40 p-4 text-center font-mono outline-none"
            readOnly
            onClick={() => {
              copyShareURL()
            }}
          />
          <div
            className={classNames(
              "relative my-2 -mt-16 w-full rounded bg-green-400 p-4 transition-opacity",
              showingShareSuccess ? "opacity-100" : "hidden opacity-0"
            )}
          >
            Copied to clipboard!
          </div>

          <button
            className="mt-4 rounded border-2 border-sky-400 p-[4px] hover:bg-sky-400 hover:text-gray-800"
            onClick={(e) => setIsSharing(false)}
          >
            Close
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap place-content-center">
        <button
          className="mx-4 rounded border-2 border-sky-400 px-4 py-2 text-center text-xl hover:bg-sky-400 hover:text-gray-800"
          onClick={(e) => addProgram()}
        >
          + Add Program
        </button>
      </div>
    </>
  )
}
