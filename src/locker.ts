/**
 * Javascript使用的异步锁
 * 锁住的进程会等待锁释放。
 * 暂不支持worker。
 * 一定要注意，如果lock和unlock中间有进程抛异常或死循环会死锁！
 * 请仔细检查lock和unlock之间的代码！！
 */

import { TicketExpiredError, WrongTicketError } from "./error";

type LockTicketType = symbol
interface ILockerOptions {
  /**
   * ContinueExcute if the ticket has been released or timeout.
   * Default to true. It will throw TicketExpiredError if false.
   * 当当前锁定代码已被释放或者超时时，是否继续执行unlock后的代码。
   * 默认为真。如果为假，将在释放后抛出TicketExpiredError。
   */
  continueExcute?: boolean
  /**
   * Timeout by microseconds. Default to Unable
   * 以毫秒为单位的默认超时时间。0为不超时。默认不超时
   */
  defaultTimeout?: number
} 

export class Locker implements ILockerOptions {
  continueExcute = true
  defaultTimeout = 0

  private nowTicket: LockTicketType | null = null
  private waitingList: LockTicketType[] = []
  private promises: {[ticket: LockTicketType]: {
    resolve: CallableFunction,
    reject: CallableFunction,
  }} = {}
  private lastRunningTime: null | Date = null
  private lastLockTime: null | Date = null
  private lockFrom: null | Date = null

  /**
   * 
   * @param options 
   */
  constructor(options: ILockerOptions = {}) {
    const { continueExcute, defaultTimeout } = options
    this.continueExcute = continueExcute ?? this.continueExcute
    this.defaultTimeout = defaultTimeout ?? this.defaultTimeout
  }

  getlockState() {
    return {
      locked: Boolean(this.nowTicket),
      /** waiting tickets */
      waiting: [...this.waitingList],
      lastRunningTime: this.lastRunningTime,
      lastLockTime: this.lastLockTime,
      lockFrom: this.lockFrom,
    }
  }

  /**
   * Use at the start of the code need to lock.
   * This will lock the locker, or waiting here if the lock is busy.
   * 用在需要锁定的代码开始的地方。
   * 当锁被占用时，将在这里等待。
   * @params timeout by microsecond. Default to the value of the locker. 以毫秒计的超时时间。默认为使用锁的默认值
   * @returns Return the ticket to unlock 返回用于解锁的ticket
   */
  lock(timeout?: number) {
    const actTime = timeout ?? this.defaultTimeout
    return new Promise<LockTicketType>((resolve, reject) => {
      const ticket = Symbol("lock ticket")
      this.promises[ticket]= { resolve, reject };
      if (this.nowTicket) {
        this.waitingList.push(ticket);
      } else {
        this.nowTicket = ticket;
        const date = new Date();
        this.lastRunningTime = date;
        this.lockFrom = date;
        this.lastLockTime = date;
        setTimeout(() => resolve(ticket));
        if (actTime > 0) {
          setTimeout(() => {
            this.release(ticket)
          }, actTime);
        }
      }
    })
  }

  private tryCallNext() {
    const next = this.waitingList.shift();
    if (next) {
      const { resolve: task } = this.promises[next]
      this.nowTicket = next;
      this.lastRunningTime = new Date();
      setTimeout(() => task(next));
    } else {
      this.nowTicket = null;
      this.lockFrom = null;
    }
  }

  /**
   * Use at the end of the code need to lock
   * This will unlock the locker and call the next in the waiting list if there are
   * 用于需要锁定的代码结束的地方
   * 这里会视为异步锁结束（并解锁），并将队列下一个加入js队列
   * @param ticket give the value return by lock()
   * @returns 
   */
  unlock(ticket: symbol) {
    return new Promise<void>((resolve, reject) => {
      if (!ticket) {
        throw new WrongTicketError()
      }
      if (ticket !== this.nowTicket) {        // Timeout but still return
        this.continueExcute ? resolve() : reject(new TicketExpiredError())
        return
      }
      delete this.promises[ticket]
      setTimeout(() => resolve())
      this.tryCallNext()
    });
  }

  /**
   * Call the next in the waiting list (if has) without waiting.
   * Caution: This won't stop the async code who lock the locker.
   * Do not use except you know what you are doing.
   * 不等待当前返回，直接调用下一个。
   * 但是注意，这不会阻止异步返回后代码继续执行。
   * 一般来说请不要使用，除非你知道你在做什么。
   * @param ticket Optional. Only release if now ticket equal this value if provided
   */
  release(ticket?: LockTicketType) {
    if (!this.nowTicket || (ticket && ticket !== this.nowTicket)) {
      return
    }
    delete this.promises[this.nowTicket]
    this.tryCallNext()
  }


  /**
   * Remove the waiting list and release the lock
   * 清空锁的队列并强制释放锁
   */
  clear() {
    this.nowTicket = null;
    this.waitingList = [];
    this.lockFrom = null;
    this.promises = {};
  };
}

export const makeLocker = () => new Locker()

export default { makeLocker, Locker }
