import { Program } from "@/components/basalProgram"
import { TimeSlot } from "@/components/timeSlot"

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
 */

function pad(num: string, size: number) {
  num = num.toString()
  while (num.length < size) num = "0" + num
  return num
}

export const encodeShareCode = (timeSlots: TimeSlot[], programs: Program[]) => {
  const compactPrograms = programs.map((program) => {
    return {
      n: program.Name,
      p: program.Percentage,
    }
  })

  const programsCompacted = programs.reduce((prev, curr) => {
    const percentageString = curr.Percentage.toString()

    const symbol = percentageString[0] === "-" ? "-" : "+"
    const perString = pad(
      percentageString[0] === "-"
        ? percentageString.substring(1)
        : percentageString,
      3
    )

    return prev + `p__${curr.Name}__${symbol}${perString}`
  }, "")

  console.log("programsCompacted", programsCompacted)

  // convert time slots to compact time slots
  const compactTimeSlots = timeSlots.map((timeSlot) => {
    return {
      s: timeSlot.Start,
      e: timeSlot.End,
      i: timeSlot.Insulin,
    }
  })

  const compactedTimeSlots = timeSlots.reduce((prev, curr) => {
    const start =
      pad(curr.Start.getHours().toString(), 2) +
      pad(curr.Start.getMinutes().toString(), 2)
    const end =
      pad(curr.End.getHours().toString(), 2) +
      pad(curr.End.getMinutes().toString(), 2)

    return prev + start + end + curr.Insulin
  }, "")

  console.log("compactedTimeSlots", compactedTimeSlots)

  console.log("asdfas", `a${compactedTimeSlots}p${programsCompacted}`)

  const data = {
    p: compactPrograms,
    t: compactTimeSlots,
  }

  return Buffer.from(JSON.stringify(data)).toString("base64")
}

export const decodeShareCode = (code: string): DecodedShareCode => {
  const decoded = Buffer.from(code, "base64").toString()
  const data = JSON.parse(decoded)

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

  return {
    timeSlots: newTimeSlots,
    programs: newPrograms,
  }
}
