import Head from "next/head"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Headline } from "../components/headline"
import { Program } from "../components/basalProgram"
import { TimeSlot, TimeSlotRow } from "../components/timeSlot"

export default function Home() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([
    {
      Name: "Base Program",
      Percentage: 0,
    },
  ])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      Start: new Date(0, 0, 0, 0, 0),
      End: new Date(0, 0, 0, 0, 30),
      Insulin: 0.05,
    },
  ])

  const getNextValidStartTime = () => {
    const lastTimeSlot = timeSlots[timeSlots.length - 1]
    return lastTimeSlot.End
  }

  const addProgram = () => {
    setPrograms([
      ...programs,
      {
        Name: "",
        Percentage: 0,
      },
    ])
  }

  const addTimeSlot = () => {
    const nextValidStartTime = getNextValidStartTime()
    const previousTimeSlot = timeSlots[timeSlots.length - 1].Start
    if (
      previousTimeSlot.getHours() == 23 &&
      previousTimeSlot.getMinutes() == 30
    ) {
      return
    }

    const nextValidEndTime = new Date(nextValidStartTime)
    nextValidEndTime.setMinutes(nextValidStartTime.getMinutes() + 30)
    timeSlots.push({
      Start: nextValidStartTime,
      End: nextValidEndTime,
      Insulin: 0.05,
    })
    setTimeSlots([...timeSlots])
  }

  const changeTimeSlotEndTime =
    (timeSlotIndex: number, direction: "increase" | "decrease") =>
    (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      const timeSlot = timeSlots[timeSlotIndex]
      const newEndTime = new Date(timeSlot.End)
      if (direction == "increase") {
        if (timeSlot.End.getHours() == 0 && timeSlot.End.getMinutes() == 0) {
          return
        }

        newEndTime.setMinutes(timeSlot.End.getMinutes() + 30)
      } else if (direction == "decrease") {
        // Ensure end time is at least 30 minutes after start time
        // and trigger deletion if it's not
        if (
          timeSlot.End.getTime() - timeSlot.Start.getTime() <=
          30 * 60 * 1000
        ) {
          if (confirm("Are you sure you want to delete this time slot?")) {
            timeSlots.splice(timeSlotIndex, 1)
            updateFollowingTimeSlots(timeSlotIndex)
          }
          return
        }

        newEndTime.setMinutes(timeSlot.End.getMinutes() - 30)
      }
      timeSlot.End = newEndTime

      // Update all following time slots
      updateFollowingTimeSlots(timeSlotIndex)
    }

  const updateFollowingTimeSlots = (timeSlotIndex: number) => {
    for (let i = timeSlotIndex + 1; i < timeSlots.length; i++) {
      const nextTimeSlot = timeSlots[i]

      const nextTimeSlotLengthInMinutes =
        (nextTimeSlot.End.getTime() - nextTimeSlot.Start.getTime()) / 1000 / 60

      nextTimeSlot.Start = new Date(timeSlots[i - 1].End)
      nextTimeSlot.End = new Date(nextTimeSlot.Start)
      nextTimeSlot.End.setMinutes(
        nextTimeSlot.Start.getMinutes() + nextTimeSlotLengthInMinutes
      )
    }
    setTimeSlots([...timeSlots])
  }

  const setTimeSlotInsulin = (
    timeSlotIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let newInsulin = parseFloat(e.target.value)

    if (isNaN(newInsulin)) {
      newInsulin = 0
    }

    if (newInsulin < 0) {
      newInsulin = 0
    }

    newInsulin = Math.round(newInsulin * 100) / 100

    // Check that last decimal is either 0 or 5
    const stringNumber = newInsulin.toFixed(2)
    const lastDigit = parseInt(stringNumber[stringNumber.length - 1])
    if (lastDigit != 0 && lastDigit != 5) {
      newInsulin = Math.round(newInsulin * 20) / 20
    }

    timeSlots[timeSlotIndex].Insulin = newInsulin
    setTimeSlots([...timeSlots])
  }

  const setPercentage = (
    programIndex: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let newPercentage = parseFloat(e.target.value)

    const program = programs[programIndex]
    program.Percentage = newPercentage
    setPrograms([...programs])
  }

  const setProgramName = (
    program: Program,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    program.Name = e.target.value
    setPrograms([...programs])
  }

  // range between -95 and +500 in intervals of 5
  const percentages = Array.from({ length: 596 }, (_, i) => i - 95).filter(
    (x) => x % 5 == 0
  )

  const share = () => {
    // convert programs to compact programs
    const compactPrograms = programs.map((program) => {
      return {
        n: program.Name,
        p: program.Percentage,
      }
    })

    // convert time slots to compact time slots
    const compactTimeSlots = timeSlots.map((timeSlot) => {
      return {
        s: timeSlot.Start,
        e: timeSlot.End,
        i: timeSlot.Insulin,
      }
    })

    const data = {
      p: compactPrograms,
      t: compactTimeSlots,
    }

    // base64 encode the data
    const buffer = Buffer.from(JSON.stringify(data))
    const base64EncodedData = buffer.toString("base64")

    const url = new URL(window.location.href)
    url.searchParams.set("share", base64EncodedData)
    navigator.clipboard.writeText(url.toString())
  }

  useEffect(() => {
    if (router.query.share) {
      const base64EncodedData = router.query.share as string
      const buffer = Buffer.from(base64EncodedData, "base64")
      const data = JSON.parse(buffer.toString())

      const compactPrograms = data.p
      const compactTimeSlots = data.t

      // convert compact programs to programs
      const newPrograms = compactPrograms.map((program: any) => {
        return {
          Name: program.n,
          Percentage: program.p,
        }
      })

      // convert compact time slots to time slots
      const newTimeSlots = compactTimeSlots.map((timeSlot: any) => {
        return {
          Start: new Date(timeSlot.s),
          End: new Date(timeSlot.e),
          Insulin: timeSlot.i,
        }
      })

      setPrograms(newPrograms)
      setTimeSlots(newTimeSlots)
    }
  }, [router.query.share])

  return (
    <>
      <Head>
        <title>Omnipod Dash Basal Program Calculator</title>
        <meta
          name="description"
          content="A tool for helping you dial in your alternative programs for your OmniPod Dash insulin pump."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Headline size={1} text="Omnipod Dash Calculator" />

      <div className="flex flex-wrap place-content-center">
        <button
          className="mx-4 rounded border-2 border-fuchsia-800 p-4 text-center text-xl"
          onClick={(e) => share()}
        >
          Share
        </button>
        <button
          className="mx-4 rounded border-2 border-fuchsia-800 p-4 text-center text-xl"
          onClick={(e) => addProgram()}
        >
          + Add Program
        </button>
      </div>

      <div className="flex flex-wrap place-content-center">
        {programs &&
          programs.map((program, index) => {
            return (
              <>
                <div
                  className="m-8 mx-8 rounded-lg bg-gray-800 p-8"
                  key={index}
                >
                  <>
                    <h2>
                      <input
                        autoFocus
                        className="mb-8 w-[100%] shrink border-b-4 bg-transparent text-4xl outline-none"
                        placeholder="Unnamed Program"
                        type="text"
                        value={program.Name}
                        onChange={(e) => setProgramName(program, e)}
                      />
                    </h2>
                    <div className="text-right">
                      {index === 0 && (
                        <button
                          className="rounded border-2 border-fuchsia-800 px-4 text-xl"
                          onClick={(e) => addTimeSlot()}
                        >
                          + Add Time
                        </button>
                      )}
                      {index > 0 && (
                        <div>
                          <select
                            className="rounded border-2 border-fuchsia-800 bg-transparent px-4 text-right text-xl"
                            onChange={(e) => setPercentage(index, e)}
                          >
                            {percentages.map((percentage) => {
                              const displayPercentage =
                                percentage > 0 ? `+${percentage}` : percentage
                              return (
                                <option
                                  value={percentage}
                                  selected={percentage === program.Percentage}
                                >
                                  {displayPercentage}%
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </div>

                    {false && timeSlots && (
                      <div className="my-4 flex h-12 rounded-lg bg-slate-600">
                        {timeSlots.map((timeSlot, tsIndex) => {
                          const width =
                            timeSlot.End.getTime() - timeSlot.Start.getTime()
                          const height = timeSlot.Insulin * 100
                          return (
                            <div
                              className="overflow-hidden rounded-lg bg-slate-50"
                              style={{ flexGrow: width, height: 48 / height }}
                            >
                              {timeSlot.Insulin}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {timeSlots &&
                      timeSlots.map((timeSlot, tsIndex) => (
                        <TimeSlotRow
                          timeSlot={timeSlot}
                          tsIndex={tsIndex}
                          programIndex={index}
                          percentage={program.Percentage}
                          setTimeSlotInsulin={setTimeSlotInsulin}
                          changeTimeSlotEndTime={changeTimeSlotEndTime}
                        />
                      ))}
                  </>
                </div>
              </>
            )
          })}
      </div>

      <div className="mt-8 mb-8 text-center text-sm text-gray-600">
        t1d.tools is a collection of Type 1 Diabetes related tools. They're all
        open source and can be found on{" "}
        <a
          href="https://github.com/t1dtools"
          className="underline hover:no-underline"
        >
          GitHub
        </a>
        .
      </div>
    </>
  )
}
