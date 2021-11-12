// tslint:disable max-classes-per-file

export class LockError extends Error {
  name = 'LockError';
}

export class WrongTicketError extends LockError {
  name = 'WrongTicketError';
}

export class TicketUnvalidError extends LockError {
  name = 'TicketUnvalidError';
}

export class LockClearError extends LockError {
  name = 'LockClearError';
}

export class LockTimeoutError extends LockError {
  name = 'LockTimeoutError';
}

// export class TicketBeenReleasedError extends TicketExpiredError {
//     name = "TicketBeenReleasedError"
// }

// export class TicketTimeoutError extends TicketExpiredError {
//     name = "TicketTimeoutError"
// }

export default { WrongTicketError, TicketUnvalidError, LockClearError, LockTimeoutError, LockError };
