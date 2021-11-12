import locker from './locker';
import code from './code';
import { wait as waitFunc } from './wait';
import error from './error';

export const lock = code.lock
export const Locker = locker.Locker
export const wait = waitFunc
export const LockerError = error.LockerError
export const WrongTicketError = error.WrongTicketError
export const TicketUnvalidError = error.TicketUnvalidError
export const LockerClearError = error.LockerClearError
export const LockerTimeoutError = error.LockerTimeoutError

export default { ...locker, ...code, wait, ...error };
