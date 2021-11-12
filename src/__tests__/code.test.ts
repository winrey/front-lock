import { lock } from '../code';
import { Lock } from '../lock';
import { wait } from '../wait';

it('accept string lock-name and promise', async () => {
  await lock('a-lock-name', wait(100));
});

it('accept Lock and function', async () => {
  const myLock = new Lock();
  const value = Symbol();
  expect(await lock(myLock, () => value)).toBe(value);
});

it('accept symbol and async', async () => {
  const value = Symbol();
  const returned = await lock(value, async () => {
    wait(100);
    return value;
  });
  expect(returned).toBe(value);
});

it('throw error and unlock when error', async () => {
  const value = Symbol();
  const codeInLock = (error = false) =>
    lock(value, async () => {
      wait(100);
      if (error) throw 'some error';
      return value;
    });
  expect(codeInLock()).resolves.toBe(value);
  expect(codeInLock(true)).rejects.toBe('some error');
  expect(codeInLock()).resolves.toBe(value);
});
