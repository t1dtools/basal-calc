import { Program } from "@/components/basalProgram"
import { TimeSlot } from "@/components/timeSlot"

export const encodeShareCode = (timeSlots: TimeSlot[], programs: Program[]) => {
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

  return Buffer.from(JSON.stringify(data)).toString("base64")
}

export const decodeShareCode = (code: string) => {
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
