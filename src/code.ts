import { Locker, makeLocker } from "./locker"


let _lookers: {[key: string]: Locker} = {}

export const lockCode = async (locker: Locker | string, func: Function) => {
  
  if (typeof locker === 'string') {
    if (!_lookers[locker]) {
      _lookers[locker] = makeLocker()
    }
    locker = _lookers[locker]
  }

  await locker.lock()
  try {
    return await func()
  } finally {
    await locker.unlock()
  }
}

export default { lockCode }
