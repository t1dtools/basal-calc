import React from "react"
import classNames from "classnames"

export type TimeSlot = {
  Start: Date
  End: Date
  Insulin: number
}

export type CompactTimeSlot = {
  s: Date
  e: Date
  i: number
}

export const TimeSlotRow = ({
  timeSlot,
  tsIndex,
  programIndex,
  percentage,
  setTimeSlotInsulin,
  changeTimeSlotEndTime,
}: {
  timeSlot: TimeSlot
  tsIndex: number
  programIndex: number
  percentage: number
  setTimeSlotInsulin: (
    tsIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void
  changeTimeSlotEndTime: (
    tsIndex: number,
    direction: "increase" | "decrease"
  ) => void
}) => {
  const startHours =
    timeSlot.Start.getHours() < 10
      ? "0" + timeSlot.Start.getHours()
      : timeSlot.Start.getHours()
  const startMinutes =
    timeSlot.Start.getMinutes() < 10
      ? "0" + timeSlot.Start.getMinutes()
      : timeSlot.Start.getMinutes()
  const endHours =
    timeSlot.End.getHours() < 10
      ? "0" + timeSlot.End.getHours()
      : timeSlot.End.getHours()
  const endMinutes =
    timeSlot.End.getMinutes() < 10
      ? "0" + timeSlot.End.getMinutes()
      : timeSlot.End.getMinutes()

  const insulinChange: number = timeSlot.Insulin * (percentage / 100)
  let timeSlotInsulin: number = timeSlot.Insulin + insulinChange
  // round timeSlotInsulin to the nearest 0.05
  const roundedTimeSlotInsulin = Math.round(timeSlotInsulin * 20) / 20
  //   const roundedTimeSlotInsulin = Math.round(timeSlotInsulin * 100) / 100

  return (
    <>
      <div
        className="flex select-none flex-row justify-between"
        key={"ts_" + tsIndex}
      >
        <div className="col-span-2 my-4 flex flex-row text-center font-mono">
          <div className="col-span-2 rounded bg-slate-500 bg-opacity-25 px-2 leading-relaxed">
            {startHours}:{startMinutes}
          </div>
          {programIndex === 0 && (
            <div
              className="ml-2 cursor-pointer rounded-l bg-red-400 px-2 text-xl"
              onClick={changeTimeSlotEndTime(tsIndex, "decrease")}
            >
              -
            </div>
          )}
          <div
            className={classNames(
              programIndex !== 0 ? "ml-2 rounded" : "",
              "col-span-2 bg-slate-500 bg-opacity-25 px-2 leading-relaxed"
            )}
          >
            {endHours}:{endMinutes}
          </div>
          {programIndex === 0 && (
            <div
              className="cursor-pointer rounded-r bg-green-400 px-2 text-xl"
              onClick={changeTimeSlotEndTime(tsIndex, "increase")}
            >
              +
            </div>
          )}
        </div>

        <div className="align-items-end my-4 ml-4 select-text text-right">
          {programIndex === 0 && (
            <input
              type="number"
              className="w-16 rounded border-2 border-fuchsia-800 bg-transparent px-2 font-mono outline-none"
              onChange={(e) => setTimeSlotInsulin(tsIndex, e)}
              value={timeSlot.Insulin}
              step="0.05"
            />
          )}
          {programIndex > 0 && percentage === 0 && (
            <>
              {timeSlotInsulin.toFixed(2)}{" "}
              <span className="hidden sm:inline">U/hr</span>
            </>
          )}
          {programIndex > 0 &&
            ((!percentage && percentage !== 0) || isNaN(percentage)) && (
              <> Invalid Program</>
            )}
          {programIndex > 0 && percentage !== 0 && !isNaN(percentage) && (
            <>
              {timeSlotInsulin.toFixed(2)} ~ {roundedTimeSlotInsulin.toFixed(2)}{" "}
              <span className="hidden sm:inline">U/hr</span>
            </>
          )}
          {programIndex === 0 && (
            <span className="ml-2 hidden sm:inline">U/hr</span>
          )}
        </div>
      </div>
    </>
  )
}
