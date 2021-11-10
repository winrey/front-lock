/**
 * Javascript使用的异步锁
 * 锁住的进程会等待锁释放。
 * 不支持worker。
 * 一定要注意，如果lock和unlock中间有进程抛异常或死循环会死锁！
 * 请仔细检查lock和unlock之间的代码！！
 */

// declare var setImmediate: (func: CallableFunction) => void
// @ts-ignore
if (!setImmediate) {
  var setImmediate = (func: CallableFunction) => setTimeout(func as any, 0)
}

export interface ILocker {
  getlockState: () => {
    locker: boolean
    waiting: number
    lastRunningTime: Date
    lastLockTime: Date
    lockFrom: Date
  }
  lock: () => Promise<void>
  unlock: () => Promise<void>
  release: () => void
}

export const makeLocker = () => {
  let locker = false;
  let waiting: any[] = [];
  let lastRunningTime: any = null;
  let lastLockTime: any = null;
  let lockFrom: any = null;
  const getlockState = () => ({
    locker,
    waiting: waiting.length,
    lastRunningTime: new Date(lastRunningTime),
    lastLockTime: new Date(lastLockTime),
    lockFrom: new Date(lockFrom)
  });
  const lock = () =>
    new Promise<void>(resolve => {
      if (locker) {
        waiting.push(resolve);
      } else {
        locker = true;
        const date = new Date();
        lastRunningTime = date;
        lockFrom = date;
        lastLockTime = date;
        setImmediate(() => resolve());
      }
    });
  const unlock = () =>
    new Promise<void>(resolve => {
      if (waiting.length > 0) {
        const task = waiting.shift();
        lastRunningTime = new Date();
        setImmediate(() => task());
      } else {
        locker = false;
        lockFrom = null;
      }
      setImmediate(() => resolve());
    });
  /**
   * 清空锁的队列并强制释放锁
   */
  const release = () => {
    locker = false;
    waiting = [];
  };

  return {
    getlockState,
    lock,
    unlock,
    release
  } as ILocker;
};

export const lockCode = async (locker: ILocker, func: Function) => {
  await locker.lock()
  try {
    return await func()
  } finally {
    await locker.unlock()
  }
}

export default { makeLocker, lockCode,  }
