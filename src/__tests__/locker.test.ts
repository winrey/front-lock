import base, { exceptArray } from '../testUtils'

import { Locker, makeLocker } from '../locker';

test('makeLocker Can Generate Locker', () => {
  const locker = makeLocker()
  expect(locker).toBeDefined()
  expect(locker.lock()).toBeInstanceOf(Promise)
  expect(locker.unlock()).toBeInstanceOf(Promise)
  const state = locker.getlockState()
  expect(state).toBeDefined()
  expect(typeof state.locked).toBe("boolean")
  expect(typeof state.waiting).toBe("number")
  expect(state.lastRunningTime).toBeInstanceOf(Date)
  expect(state.lastLockTime).toBeInstanceOf(Date)
  expect(state.lockFrom).toBe(null)
  locker.release()
});

describe('Need testFunc ', () => {
  // set id
  let _id = 10000
  let result: any[] = []
  const getNewIdVal = () => {
    return _id += 1
  }

  beforeEach(() => {
    _id = 10000
    result = []
  })

  const wait = (time: number) => new Promise<void>(r => setTimeout(() => r(), time));
  const testFunc = async (locker: Locker, time: number, done?: CallableFunction) => {
    const id = getNewIdVal();
    result.push({ id, time, op: "start" })
    // console.log(`[start] id:${id} time: ${time}`);
    await locker.lock(); // lock必须加await
    result.push({ id, time, op: "in-lock" })
    // console.log(`[in-lock] id:${id} time: ${time}`);
    await wait(time);
    result.push({ id, time, op: "out-lock" })
    // console.log(`[out-lock] id:${id} time: ${time}`);
    await locker.unlock(); // unlock加不加await都可
    result.push({ id, time, op: "end" })
    // console.log(`[end] id:${id} time: ${time}`);
    if (done) done()
  };

  const doneAndCheck = (done: CallableFunction, compared: any[]) => () => {
    // expect(result).toEqualArray()
    exceptArray(result, compared)
    // console.log(result)
    done()
  }


  test('Single Locker Simple Test', (done) => {
    const testLocker = makeLocker();
    const compared = [
      { id: 10001, time: 100, op: 'start' },
      { id: 10001, time: 100, op: 'in-lock' },
      { id: 10001, time: 100, op: 'out-lock' },
      { id: 10001, time: 100, op: 'end' }
    ]
    const runTest = async () => {
      testFunc(testLocker, 100, doneAndCheck(done, compared));
    }

    runTest()
  })

  test('Single Locker Test', (done) => {
    const testLocker = makeLocker();
    const compared = [
      { id: 10001, time: 300, op: 'start' },
      { id: 10002, time: 301, op: 'start' },
      { id: 10003, time: 302, op: 'start' },
      { id: 10001, time: 300, op: 'in-lock' },
      { id: 10001, time: 300, op: 'out-lock' },
      { id: 10002, time: 301, op: 'in-lock' },
      { id: 10001, time: 300, op: 'end' },
      { id: 10004, time: 300, op: 'start' },
      { id: 10002, time: 301, op: 'out-lock' },
      { id: 10003, time: 302, op: 'in-lock' },
      { id: 10002, time: 301, op: 'end' },
      { id: 10003, time: 302, op: 'out-lock' },
      { id: 10004, time: 300, op: 'in-lock' },
      { id: 10003, time: 302, op: 'end' },
      { id: 10004, time: 300, op: 'out-lock' },
      { id: 10004, time: 300, op: 'end' },
      { id: 10005, time: 300, op: 'start' },
      { id: 10005, time: 300, op: 'in-lock' },
      { id: 10005, time: 300, op: 'out-lock' },
      { id: 10005, time: 300, op: 'end' },
      { id: 10006, time: 300, op: 'start' },
      { id: 10007, time: 300, op: 'start' },
      { id: 10006, time: 300, op: 'in-lock' },
      { id: 10008, time: 300, op: 'start' },
      { id: 10009, time: 300, op: 'start' },
      { id: 10006, time: 300, op: 'out-lock' },
      { id: 10007, time: 300, op: 'in-lock' },
      { id: 10006, time: 300, op: 'end' },
      { id: 10007, time: 300, op: 'out-lock' },
      { id: 10008, time: 300, op: 'in-lock' },
      { id: 10007, time: 300, op: 'end' },
      { id: 10008, time: 300, op: 'out-lock' },
      { id: 10009, time: 300, op: 'in-lock' },
      { id: 10008, time: 300, op: 'end' },
      { id: 10009, time: 300, op: 'out-lock' },
      { id: 10009, time: 300, op: 'end' }
    ]
    const runTest = async () => {
      testFunc(testLocker, 300);
      testFunc(testLocker, 301);
      testFunc(testLocker, 302);
      await wait(500);
      testFunc(testLocker, 300);
      await wait(1500);
      testFunc(testLocker, 300);
      await wait(400);
      testFunc(testLocker, 300);
      testFunc(testLocker, 300);
      await wait(200);
      testFunc(testLocker, 300);
      testFunc(testLocker, 300, doneAndCheck(done, compared));
    }

    runTest()
  })

  // TODO: test timeout
})


