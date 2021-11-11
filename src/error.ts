export class WrongTicketError extends Error {
    name = "WrongTicketError"
}

export class TicketExpiredError extends Error {
    name = "TicketExpiredError"
}

// export class TicketBeenReleasedError extends TicketExpiredError {
//     name = "TicketBeenReleasedError"
// }

// export class TicketTimeoutError extends TicketExpiredError {
//     name = "TicketTimeoutError"
// }
