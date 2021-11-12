import { TicketUnvalidError } from './error';
import { ILockOptions, Lock, makeLock } from './lock';

const _locks: { [key: string | symbol | number]: Lock } = {};

export const lock = async <T>(
  codeLock: Lock | string | symbol | number,
  func: (() => T) | (() => Promise<T>) | Promise<T>,
  config: ILockOptions = {},
) => {
  const { timeout } = config;

  if (
    typeof codeLock === 'string' 
    || typeof codeLock === 'symbol' 
    || typeof codeLock === 'number'
  ) {
    if (!_locks[codeLock]) {
      _locks[codeLock] = new Lock(config);
    }
    codeLock = _locks[codeLock];
  }

  const ticket = await codeLock.lock(timeout);
  try {
    if (func instanceof Promise) {
      return await func;
    }
    return await func();
  } finally {
    await codeLock.unlock(ticket);
  }
};

export default { lock };
