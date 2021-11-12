import { lock } from '../code';
import { Locker } from '../locker';
import { wait } from '../wait';

it('accept string locker-name and promise', async () => {
  await lock('a-locker-name', wait(100));
});

it('accept locker and function', async () => {
  const locker = new Locker();
  const value = Symbol();
  expect(await lock(locker, () => value)).toBe(value);
});

it('accept symbol and async', async () => {
  const value = Symbol();
  const returned = await lock(value, async () => {
    wait(100);
    return value;
  });
  expect(returned).toBe(value);
});
