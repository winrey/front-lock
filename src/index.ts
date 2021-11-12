import lockUtil from './lock';
import code from './code';
import { wait as waitFunc } from './wait';
import error from './error';

export const lock = code.lock;
export const Lock = lockUtil.Lock;
export const makeLock = lockUtil.makeLock;
export const wait = waitFunc;
export const LockError = error.LockError;
export const WrongTicketError = error.WrongTicketError;
export const TicketUnvalidError = error.TicketUnvalidError;
export const LockClearError = error.LockClearError;
export const LockTimeoutError = error.LockTimeoutError;

export default { ...lockUtil, ...code, wait, ...error };
