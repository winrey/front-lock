import { TicketUnvalidError } from "./error";
import { ILockerOptions, Locker, makeLocker } from "./locker"


let _lockers: {[key: string | symbol | number]: Locker} = {}

export const lock = async <T>(
  locker: Locker | string | symbol | number, 
  func: (() => T) | (() => Promise<T>) | Promise<T>, 
  config: ILockerOptions = {}
) => {
  const { timeout } = config;

  if (
    typeof locker === 'string' || 
    typeof locker === 'symbol' ||
    typeof locker === 'number' 
  ) {
    if (!_lockers[locker]) {
      _lockers[locker] = new Locker(config)
    }
    locker = _lockers[locker]
  }

  const ticket = await locker.lock(timeout)
  try {
    if (func instanceof Promise) {
      return await func
    }
    return await func()
  } finally {
    await locker.unlock(ticket)
  }
}

export default { lock }
