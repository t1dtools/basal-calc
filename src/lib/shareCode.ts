import { Program } from "@/components/basalProgram"
import { TimeSlot } from "@/components/timeSlot"

const PROGRAM_SPLITTER = "%p"

interface DecodedShareCode {
  timeSlots: TimeSlot[]
  programs: Program[]
}

/**
 * Structure of the share code:
 * Example: a00000500230010p__namehere__150
 *
 * First character: version of the share code
 * Next 4 characters: first time slot start time
 * Next 3 characters: first time value
 * Repeat until we get a p
 * Take text between __ and __ and use it as the name of the program
 * Next 3 characters: first program percentage
 * Repeat until end of string
 *
 *
 * Assumptions:
 * We only need to store end times, since there's no gap between them, and we always start at 00:00
 */

function pad(num: string, size: number) {
  num = num.toString()
  while (num.length < size) num = "0" + num
  return num
}

export const encodeShareCode = (timeSlots: TimeSlot[], programs: Program[]) => {
  const programsCompacted = programs.reduce((prev, curr) => {
    const percentageString = curr.Percentage.toString()

    const symbol = percentageString[0] === "-" ? "-" : "+"
    const perString = pad(
      percentageString[0] === "-"
        ? percentageString.substring(1)
        : percentageString,
      3
    )

    return prev + `${PROGRAM_SPLITTER}${curr.Name}__${symbol}${perString}`
  }, "")

  const compactedTimeSlots = timeSlots.reduce((prev, curr) => {
    const end =
      pad(curr.End.getHours().toString(), 2) +
      pad(curr.End.getMinutes().toString(), 2)

    return `${prev}t${end}u${curr.Insulin}`
  }, "")

  return btoa(`a${compactedTimeSlots}pg${programsCompacted}`)
}

export const decodeShareCode = (code: string): DecodedShareCode => {
  code = atob(code)
  // Strip version character
  code = code.substring(1)

  const [times, programs] = code.split("pg")

  const timeSlots = times.split("t").reduce<TimeSlot[]>((prev, curr) => {
    if (curr === "") {
      return prev
    }

    const [end, insulin] = curr.split("u")
    const copy = [...prev]

    let startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      0,
      0
    )

    if (copy.length > 0) {
      startDate = copy[copy.length - 1].End
    }

    copy.push({
      Start: startDate,
      End: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        parseInt(end.substring(0, 2)),
        parseInt(end.substring(2, 4))
      ),
      Insulin: parseFloat(insulin),
    })

    return copy
  }, [])

  const finalPrograms = programs
    .split(PROGRAM_SPLITTER)
    .reduce<Program[]>((prev, curr) => {
      if (curr === "") {
        return prev
      }

      const [name, percentage] = curr.split("__")
      const copy = [...prev]

      copy.push({
        Name: name,
        Percentage: parseInt(percentage, 10),
      })

      return copy
    }, [])

  return {
    timeSlots: timeSlots,
    programs: finalPrograms,
  }
}
