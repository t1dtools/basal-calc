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
  setTimeSlotInsulin: (
    tsIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void
  changeTimeSlotEndTime: (
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
  changeTimeSlotEndTime: changeTimeSlotTime,
}: TimeSlotRowInput) => {
  const startHours =
    timeSlot.Start.getHours() < 10
      ? "0" + timeSlot.Start.getHours()
      : timeSlot.Start.getHours()
  const startMinutes =
    timeSlot.Start.getMinutes() < 10
      ? "0" + timeSlot.Start.getMinutes()
      : timeSlot.Start.getMinutes()

  const insulinChange: number = timeSlot.Insulin * (percentage / 100)
  let timeSlotInsulin: number = timeSlot.Insulin + insulinChange
  const roundedTimeSlotInsulin = Math.round(timeSlotInsulin * 20) / 20

  let canDecrease = isFirst ? false : true;
  let canIncrease = isLast ? false : true;

  // Check if previous time slot is more than 30 minutes earlier
  if (previousTimeSlot !== null) {
    // Diff timeSlot start and previousTimeSlot start in minutes
    const diff = (timeSlot.Start.getTime() - previousTimeSlot.Start.getTime()) / 1000 / 60
    if (diff >= 60) {
      canDecrease = true
    } else if (diff <= 30) {
      canDecrease = false
    }
  }

  // Check if next time slot is more than 30 minutes later
  if (nextTimeSlot !== null) {
    // Diff timeSlot start and nextTimeSlot start in minutes
    const diff = (nextTimeSlot.Start.getTime() - timeSlot.Start.getTime()) / 1000 / 60
    if (diff <= 30) {
      canIncrease = false
    }
  }

  return (
    <>
    {showHeaders && (
          <>
            <div>Starting</div>
            <div>Insulin</div>
          </>
        )}
      <div
        className="flex select-none flex-row justify-between"
        key={"ts_" + tsIndex}
      >
        <div className="col-span-2 my-4 flex flex-row text-center font-mono">
          {programIndex === 0 && (
            <button
              className={classNames(
                !canDecrease && "opacity-20 cursor-not-allowed",
                "ml-2 cursor-pointer rounded-l bg-red-400 px-2 text-xl"
              )}
              disabled={!canDecrease}
              onClick={() => changeTimeSlotTime(tsIndex, "decrease")}
            >
              -
            </button>
          )}
          <div className="col-span-2 rounded bg-slate-500 bg-opacity-25 px-2 leading-relaxed">
            {startHours}:{startMinutes}
          </div>
          {programIndex === 0 && (
            <button
              className={classNames(
                !canIncrease && "opacity-20 cursor-not-allowed",
                "cursor-pointer rounded-r bg-green-400 px-2 text-xl"
              )}
              disabled={!canIncrease}
              onClick={() => changeTimeSlotTime(tsIndex, "increase")}
            >
              +
            </button>
          )}
        </div>

        <div className="align-items-end my-4 ml-4 select-text text-right">
          {programIndex === 0 && (
            <input
              type="number"
              className="w-16 rounded bg-sky-400 bg-opacity-40 px-2 text-right font-mono outline-none"
              onChange={(e) => setTimeSlotInsulin(tsIndex, e)}
              value={timeSlot.Insulin}
              step="0.05"
            />
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
