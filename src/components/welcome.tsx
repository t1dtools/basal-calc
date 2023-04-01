import React from "react"
import { t } from "../lib/translate"

export const Welcome = ({
  showWelcome,
  arrivedFromShare,
  addProgram,
  share,
  setShowWelcome,
}: {
  showWelcome: boolean
  arrivedFromShare: boolean
  addProgram: () => void
  share: () => void
  setShowWelcome: (show: boolean) => void
}) => {
  return (
    <>
      {showWelcome && !arrivedFromShare && (
        <div className="m-8 mx-auto w-96 rounded-lg bg-gray-800 p-8">
          <p>
            {t(
              "This site aims to help you calculate alternative programs based on a percentage of a base program."
            )}
          </p>
          <p>
            {t(
              "Get started by setting up your base program below, and create as many alternative as you want with the"
            )}{" "}
            <button
              className="rounded border-2 border-sky-400 p-[4px] text-xs hover:bg-sky-400 hover:text-gray-800"
              onClick={(e) => addProgram()}
            >
              + {t("Add Program")}
            </button>{" "}
            {t("button below.")}
          </p>
          <p className="mt-4">
            {t("You can also use the")}{" "}
            <button
              className="rounded border-2 border-sky-400 p-[4px] text-xs hover:bg-sky-400 hover:text-gray-800"
              onClick={(e) => share()}
            >
              {t("Share")}
            </button>{" "}
            {t(
              "button to create a link you can use to share this with others."
            )}
          </p>
          <p className="mt-4">
            You can also view a{" "}
            <a
              href="?share=YXQwMjMwdTEuMzV0MDUzMHUxLjE1dDA3MDB1MS40dDE0MDB1MC44dDIxMDB1MS4xNXQyMzAwdTIuMDV0MjMzMHUxLjM1JXBnJXBCYXNlIFByb2dyYW1fXyswMDAlcFdlZWtlbmRfXyswMzUlcFNpY2tfXysxNDAlcEJvb3plZCEg8J%2BNu19fLTAyNQ"
              className="rounded border-2 border-sky-400 p-[4px] text-xs hover:bg-sky-400 hover:text-gray-800"
            >
              Sample Program
            </a>{" "}
            if you want.
          </p>

          <p className="text-right">
            <button
              className="text-md mt-4 rounded border-2 border-sky-400 p-[4px] hover:bg-sky-400 hover:text-gray-800"
              onClick={(e) => setShowWelcome(false)}
            >
              Hide
            </button>
          </p>
        </div>
      )}

      {arrivedFromShare && showWelcome && (
        <div className="m-8 mx-auto w-96 rounded-lg bg-gray-800 p-8">
          <p className="text-center text-lg font-bold">
            Someone has shared their basal program with you!
          </p>

          <p className="mt-4">
            This link will always open this program. If you make any changes
            below that you want to share, make sure to click the{" "}
            <button
              className="rounded border-2 border-sky-400 p-[4px] text-xs hover:bg-sky-400 hover:text-gray-800"
              onClick={(e) => share()}
            >
              Share
            </button>{" "}
            button, and get your own share link.
          </p>

          <p className="text-right">
            <button
              className="text-md mt-4 rounded border-2 border-sky-400 p-[4px] hover:bg-sky-400 hover:text-gray-800"
              onClick={(e) => setShowWelcome(false)}
            >
              Hide
            </button>
          </p>
        </div>
      )}
    </>
  )
}
