export class LockerError extends Error {
    name = "LockerError"
}

export class WrongTicketError extends LockerError {
    name = "WrongTicketError"
}

export class TicketUnvalidError extends LockerError {
    name = "TicketUnvalidError"
}

export class LockerClearError extends LockerError {
    name = "LockerClearError"
}

export class LockerTimeoutError extends LockerError {
    name = "LockerTimeoutError"
}

// export class TicketBeenReleasedError extends TicketExpiredError {
//     name = "TicketBeenReleasedError"
// }

// export class TicketTimeoutError extends TicketExpiredError {
//     name = "TicketTimeoutError"
// }

export default { WrongTicketError, TicketUnvalidError, LockerClearError, LockerTimeoutError, LockerError }
