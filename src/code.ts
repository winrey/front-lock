import { ILocker, makeLocker } from "./locker"


let _lookers: {[key: string]: ILocker} = {}

export const lockCode = async (locker: ILocker | string, func: Function) => {
  
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
