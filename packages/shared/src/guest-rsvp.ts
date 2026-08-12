export function resolveGuestRsvpJourney(status: "confirmed"|"cancelled"|"refunded"|"checked_in") {
  const complete = status === "checked_in";
  return { status, canInvite: status === "confirmed", canCancel: status === "confirmed", passActive: ["confirmed","checked_in"].includes(status), steps: [
    { id:"reserved",label:"Place reserved",state: status === "cancelled" || status === "refunded" ? "stopped" : "complete" },
    { id:"invite",label:"Bring your group",state: status === "confirmed" ? "current" : complete ? "complete" : "stopped" },
    { id:"arrive",label:"Show your pass",state: complete ? "complete" : status === "confirmed" ? "upcoming" : "stopped" },
  ] };
}
