import Head from "next/head"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Headline } from "../components/headline"
import { Program } from "../components/basalProgram"
import { TimeSlot, TimeSlotRow } from "../components/timeSlot"
import { Welcome } from "../components/welcome"
import { Actions } from "../components/actions"
import { encodeShareCode, decodeShareCode } from "@/lib/shareCode"
import { t } from "@/lib/translate"

export default function Home() {
  const router = useRouter()
  
  const [isSharing, setIsSharing] = useState(false)
  const [shareURL, setShareURL] = useState("")
  const [showingShareSuccess, setShowingShareSuccess] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [arrivedFromShare, setArrivedFromShare] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([
    {
      Name: t("Base Program"),
      Percentage: 0,
    },
  ])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      Start: new Date(0, 0, 0, 0, 0),
      Insulin: 0.05,
    },
  ])

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
    const previousStartTime = timeSlots[timeSlots.length - 1].Start

    if (
      previousStartTime.getHours() == 23 &&
      previousStartTime.getMinutes() == 30
    ) {
      return
    }

    const nextValidStartTime = new Date(previousStartTime)
    nextValidStartTime.setMinutes(previousStartTime.getMinutes() + 30)

    timeSlots.push({
      Start: nextValidStartTime,
      Insulin: 0.05,
    })
    setTimeSlots([...timeSlots])
  }

  const changeTimeSlotTime = (
    timeSlotIndex: number,
    direction: "increase" | "decrease"
  ) => {
    const timeSlot = timeSlots[timeSlotIndex]
    const newStartTime = timeSlot.Start
    if (direction == "increase") {
      newStartTime.setMinutes(timeSlot.Start.getMinutes() + 30)
    } else if (direction == "decrease") {
      // Ensure end time is at least 30 minutes after start time
      // and trigger deletion if it's not
      // if (timeSlot.End.getTime() - timeSlot.Start.getTime() <= 30 * 60 * 1000) {
      //   if (timeSlotIndex === 0) {
      //     return
      //   }

      //   if (confirm("Are you sure you want to delete this time slot?")) {
      //     timeSlots.splice(timeSlotIndex, 1)
      //     updateFollowingTimeSlots(timeSlotIndex)
      //   }
      //   return
      // }

      newStartTime.setMinutes(timeSlot.Start.getMinutes() - 30)
    }
    timeSlot.Start = newStartTime
    setTimeSlots([...timeSlots])

    // Update all following time slots
    // updateFollowingTimeSlots(timeSlotIndex)
  }

  // const updateFollowingTimeSlots = (timeSlotIndex: number) => {
  //   for (let i = timeSlotIndex + 1; i < timeSlots.length; i++) {
  //     const nextTimeSlot = timeSlots[i]

  //     const nextTimeSlotLengthInMinutes =
  //       (nextTimeSlot.End.getTime() - nextTimeSlot.Start.getTime()) / 1000 / 60

  //     nextTimeSlot.Start = new Date(timeSlots[i - 1].Start)
  //     nextTimeSlot.End = new Date(nextTimeSlot.Start)
  //     nextTimeSlot.End.setMinutes(
  //       nextTimeSlot.Start.getMinutes() + nextTimeSlotLengthInMinutes
  //     )
  //   }
  //   setTimeSlots([...timeSlots])
  // }

  const setTimeSlotInsulin = (
    timeSlotIndex: number,
    newInsulin: number,
  ) => {
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

  const reset = () => {
    if (confirm("Are you sure you want to reset and start over?")) {
      setPrograms([
        {
          Name: t("Base Program"),
          Percentage: 0,
        },
      ])
      setTimeSlots([
        {
          Start: new Date(0, 0, 0, 0, 0),
          Insulin: 0.05,
        },
      ])

      let url = new URL(window.location.href)
      url.search = ""
      router.push(url.toString())
      setShareURL(url.toString())
    }
  }

  const share = () => {
    setIsSharing(true)

    const base64EncodedData = encodeShareCode(timeSlots, programs)

    const url = new URL(window.location.href)
    url.searchParams.set("share", base64EncodedData)
    navigator.clipboard.writeText(url.toString())
    router.push(url.toString())
    setShareURL(url.toString())
  }

  useEffect(() => {
    if (router.query.share) {
      setArrivedFromShare(true)
      const base64EncodedData = router.query.share as string
      const decoded = decodeShareCode(base64EncodedData)

      setPrograms(decoded.programs)
      setTimeSlots(decoded.timeSlots)
    }
  }, [router.query.share])

  return (
    <>
      <Head>
        <title>{t("Basal Insulin Program Calculator")}</title>
        <meta
          name="description"
          content="A tool for helping you dial in your alternative basal programs for your insulin pump."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Headline
        size={1}
        text="Basal Insulin Calculator"
        subheadline="A tool for helping you dial in your alternative basal programs for your insulin pump."
      />

      <Welcome showWelcome={showWelcome} arrivedFromShare={arrivedFromShare} addProgram={addProgram} share={share} setShowWelcome={setShowWelcome} />

      <Actions router={router} timeSlots={timeSlots} programs={programs} setIsSharing={setIsSharing} isSharing={isSharing} shareURL={shareURL} share={share} setShowingShareSuccess={setShowingShareSuccess} showingShareSuccess={showingShareSuccess} addProgram={addProgram} reset={reset} />
      

      <div className="flex flex-wrap place-content-center">
        {programs &&
          programs.map((program, index) => {
            return (
              <div key={"program_" + index}>
                <div className="m-8 rounded-lg bg-gray-800 p-8">
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
                          className="text-md rounded border-2 border-sky-400 px-2 py-2 text-center
                          hover:bg-sky-400 hover:text-gray-800"
                          onClick={(e) => addTimeSlot()}
                        >
                          + Add Time Slot
                        </button>
                      )}
                      {index > 0 && (
                        <div>
                          Change from {programs[0].Name} by{" "}
                          <select
                            className="text-md rounded border-2 border-sky-400 bg-transparent px-2 py-2 text-right hover:bg-sky-400 hover:text-gray-800"
                            onChange={(e) => setPercentage(index, e)}
                            title={"Percentage of " + programs[0].Name}
                            defaultValue={program.Percentage}
                          >
                            {percentages.map((percentage) => {
                              const displayPercentage =
                                percentage > 0 ? `+${percentage}` : percentage
                              return (
                                <option
                                  key={displayPercentage}
                                  value={percentage}
                                >
                                  {displayPercentage}%
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                    {timeSlots &&
                      timeSlots.map((timeSlot, tsIndex) => {
                        return (
                          <TimeSlotRow
                            showHeaders={tsIndex === 0}
                            isFirst={tsIndex === 0}
                            isLast={tsIndex === timeSlots.length - 1}
                            key={"tsr_" + tsIndex}
                            timeSlot={timeSlot}
                            previousTimeSlot={tsIndex > 0 ? timeSlots[tsIndex - 1] : null}
                            nextTimeSlot={tsIndex !== timeSlots.length - 1 ? timeSlots[tsIndex + 1] : null}
                            tsIndex={tsIndex}
                            programIndex={index}
                            percentage={program.Percentage}
                            setTimeSlotInsulin={setTimeSlotInsulin}
                            changeTimeSlotTime={changeTimeSlotTime}
                          />
                        )
                      })}
                  </>
                </div>
              </div>
            )
          })}
      </div>

      <div className="mt-8 mb-8 text-center text-sm text-gray-600">
        t1d.tools is a collection of Type 1 Diabetes related tools. They&apos;re
        all open source and can be found on{" "}
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
