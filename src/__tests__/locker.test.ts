import { makeLocker, lockCode } from '../locker';

test('Can Generate Locker', () => {
  const locker = makeLocker()
  expect(locker).toBeDefined()
  expect(locker.lock()).toBeInstanceOf(Promise)
  expect(locker.unlock()).toBeInstanceOf(Promise)
  const state = locker.getlockState()
  expect(state).toBeDefined()
  expect(typeof state.locker).toBe("boolean")
  expect(typeof state.waiting).toBe("number")
  expect(state.lastRunningTime).toBeInstanceOf(Date)
  expect(state.lastLockTime).toBeInstanceOf(Date)
  expect(state.lockFrom).toBeInstanceOf(Date)
  locker.release()
});

test('', () => {
  

const test = async () => {
  const testLocker = makeLocker();
  const wait = (time: any) => new Promise<void>(r => setTimeout(() => r(), time));
  const testFunc = async (time: any) => {
    const id = Math.round(Math.random() * 10000);
    console.log(`[start] id:${id} time: ${time}`);
    await testLocker.lock(); // lock必须加await
    console.log(`[in-lock] id:${id} time: ${time}`);
    await wait(time);
    console.log(`[out-lock] id:${id} time: ${time}`);
    await testLocker.unlock(); // unlock加不加await都可
    console.log(`[end] id:${id} time: ${time}`);
  };

  testFunc(3000);
  testFunc(3001);
  testFunc(3002);
  await wait(5000);
  testFunc(3000);
  await wait(15000);
  testFunc(3000);
  await wait(4000);
  testFunc(3000);
};

// test();
})

