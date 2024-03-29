import { Program } from "@/components/basalProgram"
import { TimeSlot } from "@/components/timeSlot"

const SPLITTER = "%pg"
const PROGRAM_SPLITTER = "%p"
const PROGRAM_NAME_SPLITTER = "__"

const TIMES_SPLITTER = "t"
const UNIT_SPLITTER = "u"

interface DecodedShareCode {
  timeSlots: TimeSlot[]
  programs: Program[]
}

// Credit: https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
function pad(num: string, size: number) {
  return String(num).padStart(size, "0")
}

export const encodeShareCode = (timeSlots: TimeSlot[], programs: Program[]) => {
  return Buffer.from(`a${encodeTimeSlots(timeSlots)}${SPLITTER}${encodePrograms(programs)}`).toString("base64").replaceAll("=", "")
}

export const decodeShareCode = (code: string): DecodedShareCode => {
  code = Buffer.from(code, "base64").toString("utf-8")

  // Strip version character
  code = code.substring(1)

  const [times, programs] = code.split(SPLITTER)
  const decodedTimes = decodeTimeSlots(times)
  const decodedPrograms = decodePrograms(programs)

  return {
    timeSlots: decodedTimes,
    programs: decodedPrograms,
  }
}

function encodeTimeSlots(timeSlots: TimeSlot[]) {
  return timeSlots.reduce((prev, curr) => {
    const start =
      pad(curr.Start.getHours().toString(), 2) +
      pad(curr.Start.getMinutes().toString(), 2)

    return `${prev}${TIMES_SPLITTER}${start}${UNIT_SPLITTER}${curr.Insulin}`
  }, "")
}

function encodePrograms(programs: Program[]) {
  return programs.reduce((prev, curr) => {
    const percentageString = curr.Percentage.toString()

    const symbol = percentageString[0] === "-" ? "-" : "+"
    const perString = pad(
      percentageString[0] === "-"
        ? percentageString.substring(1)
        : percentageString,
      3
    )

    return (
      prev +
      `${PROGRAM_SPLITTER}${curr.Name}${PROGRAM_NAME_SPLITTER}${symbol}${perString}`
    )
  }, "")
}

function decodeTimeSlots(times: string) {
  return times.split(TIMES_SPLITTER).reduce<TimeSlot[]>((prev, curr) => {
    if (curr === "") {
      return prev
    }

    const [start, insulin] = curr.split(UNIT_SPLITTER)
    const copy = [...prev]

    copy.push({
      Start: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        parseInt(start.substring(0, 2)),
        parseInt(start.substring(2, 4))
      ),
      Insulin: parseFloat(insulin),
    })

    return copy
  }, [])
}

function decodePrograms(programs: string) {
  return programs.split(PROGRAM_SPLITTER).reduce<Program[]>((prev, curr) => {
    if (curr === "") {
      return prev
    }

    const [name, percentage] = curr.split(PROGRAM_NAME_SPLITTER)
    const copy = [...prev]

    copy.push({
      Name: name,
      Percentage: parseInt(percentage, 10),
    })

    return copy
  }, [])
}
