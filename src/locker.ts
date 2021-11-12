/**
 * Javascript使用的异步锁
 * 锁住的进程会等待锁释放。
 * 暂不支持worker。
 * 一定要注意，如果lock和unlock中间有进程抛异常或死循环会死锁！
 * 请仔细检查lock和unlock之间的代码！！
 */

import { LockerClearError, LockerTimeoutError, TicketUnvalidError, WrongTicketError } from './error';
import { uuid } from './uuid';

export type LockTicketType = symbol | string;
export interface ILockerOptions {
  /**
   * ContinueExcute if the ticket has been released or timeout.
   * Default to true. It will throw TicketExpiredError if false.
   * 当当前锁定代码已被释放或者超时时，是否继续执行unlock后的代码。
   * 默认为真。如果为假，将在释放后抛出TicketExpiredError。
   */
  continueExcute?: boolean;
  /**
   * Timeout by microseconds. Default to Unable
   * 以毫秒为单位的超时时间。0为无超时检测。默认无超时检测
   */
  timeout?: number;
  /**
   * Whether throw Error when timeout(LockerTimeoutError) or clear(LockerClearError). Default to true.
   * 是否在超时和锁清空时为lock抛出错误，默认为真
   */
  throwLockError?: boolean;
  /**
   * Whether throw Error when ticket unvalid. Default to true.
   * 是否在unlock抛出ticket的验证错误，默认为真
   */
  throwUnlockError?: boolean;
}

// support ES5
if (!Symbol) {
  Symbol = uuid as any
}

export class Locker implements ILockerOptions {
  continueExcute = true;
  timeout = 0;
  throwLockError = true;
  throwUnlockError = true;
  es5 = false;

  private nowTicket: LockTicketType | null = null;
  private waitingList: LockTicketType[] = [];
  private promises: {
    [ticket: LockTicketType]: {
      resolve: CallableFunction;
      reject: CallableFunction;
    };
  } = {};
  private timeoutSetting: { [ticket: LockTicketType]: number | undefined } = {};

  private lastRunningTime: null | Date = null;
  private lastLockTime: null | Date = null;
  private lockFrom: null | Date = null;

  private timeoutHandlers: { [ticket: LockTicketType]: number } = {};

  /**
   *
   * @param options
   */
  constructor(options: ILockerOptions = {}) {
    const { continueExcute, timeout, throwLockError, throwUnlockError } = options;
    this.continueExcute = continueExcute ?? this.continueExcute;
    this.timeout = timeout ?? this.timeout;
    this.throwLockError = throwLockError ?? this.throwLockError;
    this.throwUnlockError = throwUnlockError ?? this.throwUnlockError;
  }

  getlockState() {
    return {
      locked: Boolean(this.nowTicket),
      /** waiting tickets */
      waiting: [...this.waitingList],
      lastRunningTime: this.lastRunningTime,
      lastLockTime: this.lastLockTime,
      lockFrom: this.lockFrom,
    };
  }

  private tryAddTimeout(ticket: LockTicketType) {
    const timeout = this.timeoutSetting[ticket];
    const actTime = timeout ?? this.timeout;
    if (actTime > 0) {
      this.timeoutHandlers[ticket] = setTimeout(() => {
        const { reject } = this.promises[ticket];
        if (this.release(ticket)) {
          if (this.throwLockError) {
            reject(new LockerTimeoutError());
          }
          return;
        }
      }, actTime);
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
    return new Promise<LockTicketType>((resolve, reject) => {
      const ticket = Symbol('lock ticket');
      this.timeoutSetting[ticket] = timeout;
      this.promises[ticket] = { resolve, reject };
      this.waitingList.push(ticket);
      if (!this.nowTicket) {
        const date = new Date();
        this.lockFrom = date;
        this.lastLockTime = date;
        this.tryCallNext(date);
      }
    });
  }

  private tryCallNext(runningTime?: Date) {
    const next = this.waitingList.shift();
    if (next) {
      const { resolve: task } = this.promises[next];
      this.nowTicket = next;
      this.lastRunningTime = runningTime ?? new Date();
      setTimeout(() => task(next));
      this.tryAddTimeout(next);
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
  unlock(ticket: LockTicketType) {
    return new Promise<void>((resolve, reject) => {
      if (!ticket) {
        throw new WrongTicketError();
      }
      if (ticket !== this.nowTicket) {
        // Timeout but still return
        if (this.continueExcute) resolve();
        else if (this.throwUnlockError) reject(new TicketUnvalidError());
        return;
      }
      this.clearTicket(ticket);
      setTimeout(() => resolve());
      this.tryCallNext();
    });
  }

  private clearTicket(ticket: LockTicketType) {
    if (this.waitingList.includes(ticket)) {
      this.waitingList = [...this.waitingList.filter((t) => t !== ticket)];
    }
    if (this.promises[ticket]) {
      delete this.promises[ticket];
    }
    if (this.timeoutHandlers[ticket]) {
      clearTimeout(this.timeoutHandlers[ticket]);
      delete this.timeoutHandlers[ticket];
    }
  }

  /**
   * Call the next in the waiting list (if has) without waiting.
   * Caution: This won't stop the async code who lock the locker.
   * Do not use except you know what you are doing.
   * 不等待当前返回，直接调用下一个。
   * 但是注意，这不会阻止异步返回后代码继续执行。
   * 一般来说请不要使用，除非你知道你在做什么。
   * @param ticketOnly Optional. Only release if now ticket equal this value if provided
   */
  release(ticketOnly?: LockTicketType) {
    if (!this.nowTicket || (ticketOnly && ticketOnly !== this.nowTicket)) {
      return;
    }
    this.clearTicket(this.nowTicket);
    this.tryCallNext();
    return true;
  }

  /**
   * Remove the waiting list and release the lock
   * 清空锁的队列并强制释放锁
   */
  clear() {
    this.nowTicket = null;
    this.waitingList = [];
    this.lockFrom = null;
    Object.values<number>(this.timeoutHandlers).forEach((handler) => {
      clearTimeout(handler);
    });
    if (this.throwLockError) {
      Object.values<{ reject: (err: any) => void }>(this.promises as any).forEach(({ reject }) => {
        setTimeout(() => reject(new LockerClearError()));
      });
    }
    this.timeoutHandlers = {};
    this.promises = {};
  }
}

export const makeLocker = (config?: ILockerOptions) => new Locker(config);

export default { makeLocker, Locker };
