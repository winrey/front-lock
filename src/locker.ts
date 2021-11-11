/**
 * Javascript使用的异步锁
 * 锁住的进程会等待锁释放。
 * 暂不支持worker。
 * 一定要注意，如果lock和unlock中间有进程抛异常或死循环会死锁！
 * 请仔细检查lock和unlock之间的代码！！
 */

export class Locker {
  locked = false;
  waiting: any[] = [];
  lastRunningTime: null | Date = null;
  lastLockTime: null | Date = null;
  lockFrom: null | Date = null;

  getlockState() {
    return {
      locked: this.locked,
      waiting: this.waiting.length,
      lastRunningTime: this.lastRunningTime,
      lastLockTime: this.lastLockTime,
      lockFrom: this.lockFrom,
    }
  }

  lock() {
    return new Promise<void>(resolve => {
      if (this.locked) {
        this.waiting.push(resolve);
      } else {
        this.locked = true;
        const date = new Date();
        this.lastRunningTime = date;
        this.lockFrom = date;
        this.lastLockTime = date;
        setTimeout(() => resolve());
      }
    })
  }

  unlock() {
    return new Promise<void>(resolve => {
      if (this.waiting.length > 0) {
        const task = this.waiting.shift();
        this.lastRunningTime = new Date();
        setTimeout(() => task());
      } else {
        this.locked = false;
        this.lockFrom = null;
      }
      setTimeout(() => resolve());
    });
  }


  /**
   * Remove the waiting list and release the lock
   * 清空锁的队列并强制释放锁
   */
  release() {
    this.locked = false;
    this.waiting = [];
  };


  /**
   * Remove the waiting list and release the lock
   * 清空锁的队列并强制释放锁
   */
  clear() {
    this.locked = false;
    this.waiting = [];
  };
}

export const makeLocker = () => new Locker()

export default { makeLocker, Locker }
