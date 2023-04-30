import React from "react"
import classNames from "classnames"
import { t } from "../lib/translate"

export type TimeSlot = {
  Start: Date
  Insulin: number
}

export type CompactTimeSlot = {
  s: Date
  i: number
}

export type TimeSlotRowInput = {
  showHeaders: boolean
  timeSlot: TimeSlot
  previousTimeSlot: TimeSlot | null
  nextTimeSlot: TimeSlot | null
  tsIndex: number
  programIndex: number
  percentage: number
  isFirst: boolean
  isLast: boolean
  setTimeSlotInsulin: (tsIndex: number, newInsulin: number) => void
  changeTimeSlotTime: (
    tsIndex: number,
    direction: "increase" | "decrease"
  ) => void
}

export const TimeSlotRow = ({
  showHeaders,
  timeSlot,
  previousTimeSlot,
  nextTimeSlot,
  tsIndex,
  programIndex,
  percentage,
  isFirst,
  isLast,
  setTimeSlotInsulin,
  changeTimeSlotTime: changeTimeSlotTime,
}: TimeSlotRowInput) => {
  const startHours =
    timeSlot.Start.getHours() < 10
      ? "0" + timeSlot.Start.getHours()
      : timeSlot.Start.getHours()
  const startMinutes =
    timeSlot.Start.getMinutes() < 10
      ? "0" + timeSlot.Start.getMinutes()
      : timeSlot.Start.getMinutes()

  const insulinAsString = timeSlot.Insulin.toString()
  const insulinMajor = insulinAsString.split(".")[0]
  const insulinMinor = insulinAsString.split(".")[1]
  const changeMajor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newInsulin = parseFloat(newValue + "." + insulinMinor)
    setTimeSlotInsulin(tsIndex, newInsulin)
  }
  const changeMinor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newInsulin = parseFloat(insulinMajor + "." + newValue)
    setTimeSlotInsulin(tsIndex, newInsulin)
  }

  const insulinChange: number = timeSlot.Insulin * (percentage / 100)
  let timeSlotInsulin: number = timeSlot.Insulin + insulinChange
  const roundedTimeSlotInsulin = Math.round(timeSlotInsulin * 20) / 20

  let canDecrease = isFirst ? false : true
  let canIncrease = isFirst ? false : true
  let decreaseDisableReason = isFirst
    ? "The first time must be at midnight"
    : ""
  let increaseDisableReason = isFirst
    ? "The first time must be at midnight"
    : ""

  // Check if previous time slot is more than 30 minutes earlier
  if (previousTimeSlot !== null) {
    // Diff timeSlot start and previousTimeSlot start in minutes
    const diff =
      (timeSlot.Start.getTime() - previousTimeSlot.Start.getTime()) / 1000 / 60
    if (diff >= 60) {
      canDecrease = true
    } else if (diff <= 30) {
      canDecrease = false
      decreaseDisableReason = "The previous time is too close to this one"
    }
  }

  // Check if next time slot is more than 30 minutes later
  if (nextTimeSlot !== null) {
    // Diff timeSlot start and nextTimeSlot start in minutes
    const diff =
      (nextTimeSlot.Start.getTime() - timeSlot.Start.getTime()) / 1000 / 60
    if (diff <= 30) {
      canIncrease = false
      increaseDisableReason = "The next time is too close to this one"
    }
  }

  // if time is 23:30, disable increase
  if (timeSlot.Start.getHours() === 23 && timeSlot.Start.getMinutes() === 30) {
    canIncrease = false
    increaseDisableReason = "The last time can not be later than 23:30"
  }

  if (previousTimeSlot === null && nextTimeSlot === null) {
    canDecrease = false
    canIncrease = false
  }

  return (
    <>
      {showHeaders && (
        <>
          <div>Start Time</div>
          <div>Insulin</div>
        </>
      )}
      <div
        className="flex select-none flex-row justify-between"
        key={"ts_" + tsIndex}
      >
        <div className="my-4 flex flex-row text-center font-mono">
          {programIndex === 0 && (
            <button
              className={classNames(
                !canDecrease && "cursor-not-allowed opacity-20",
                "ml-2 cursor-pointer rounded-l bg-red-400 px-2 text-xl"
              )}
              disabled={!canDecrease}
              onClick={() => changeTimeSlotTime(tsIndex, "decrease")}
              title={decreaseDisableReason || ""}
            >
              -
            </button>
          )}
          <div
            className={classNames(
              "bg-slate-500 bg-opacity-25 px-2 leading-relaxed",
              programIndex > 0 ? "rounded" : ""
            )}
          >
            {startHours}:{startMinutes}
          </div>
          {programIndex === 0 && (
            <button
              className={classNames(
                !canIncrease && "cursor-not-allowed opacity-20",
                "cursor-pointer rounded-r bg-green-400 px-2 text-xl"
              )}
              disabled={!canIncrease}
              onClick={() => changeTimeSlotTime(tsIndex, "increase")}
              title={increaseDisableReason || ""}
            >
              +
            </button>
          )}
        </div>

        <div className="align-items-end my-4 ml-4 select-text text-right">
          {programIndex === 0 && (
            <>
              <input
                type="text"
                className="mr-1 w-10 rounded bg-sky-400 bg-opacity-40 px-2 text-right font-mono outline-none"
                inputMode="numeric"
                onChange={(e) => changeMajor(e)}
                value={insulinMajor}
                step="1"
              />
              .
              <input
                type="text"
                className="ml-1 w-10 rounded bg-sky-400 bg-opacity-40 px-2 text-right font-mono outline-none"
                inputMode="numeric"
                onChange={(e) => changeMinor(e)}
                value={insulinMinor}
                step="5"
              />
            </>
          )}
          {programIndex > 0 && percentage === 0 && (
            <span className="text-sky-400">
              {timeSlotInsulin.toFixed(2)}{" "}
              <span className="hidden sm:inline">{t("U/hr")}</span>
            </span>
          )}
          {programIndex > 0 &&
            ((!percentage && percentage !== 0) || isNaN(percentage)) && (
              <> {t("Invalid Program")}</>
            )}
          {programIndex > 0 && percentage !== 0 && !isNaN(percentage) && (
            <>
              <span className="text-xs">{timeSlotInsulin.toFixed(2)} ~ </span>
              <span className="text-sky-400">
                {roundedTimeSlotInsulin.toFixed(2)}
              </span>{" "}
              <span className="hidden text-sky-400 sm:inline">{t("U/hr")}</span>
            </>
          )}
          {programIndex === 0 && (
            <span className="ml-2 hidden sm:inline">{t("U/hr")}</span>
          )}
        </div>
      </div>
    </>
  )
}
