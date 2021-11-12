import { Locker, makeLocker } from '../locker';
import { wait } from '../wait';

test('makeLocker Can Generate Locker', async () => {
  const locker = makeLocker();
  expect(locker).toBeDefined();
  const ticket = await locker.lock();
  expect(typeof ticket).toBe('symbol');
  expect(locker.unlock(ticket)).toBeInstanceOf(Promise);
  const state = locker.getlockState();
  expect(state).toBeDefined();
  expect(typeof state.locked).toBe('boolean');
  // expect(typeof state.waiting).toBeInstanceOf(Array)
  expect(state.lastRunningTime).toBeInstanceOf(Date);
  expect(state.lastLockTime).toBeInstanceOf(Date);
  expect(state.lockFrom).toBe(null);
  locker.release();
});

jest.setTimeout(10000);

describe('Need testFunc ', () => {
  // set id
  let _id = 10000;
  let result: any[] = [];
  const getNewIdVal = () => {
    return (_id += 1);
  };

  beforeEach(() => {
    _id = 10000;
    result = [];
  });

  const testFunc = async (locker: Locker, time: number, done?: CallableFunction) => {
    const id = getNewIdVal();
    let stopLog = false;
    const thisResult = result;
    thisResult.push({ id, time, op: 'start' });
    // console.log(`[start] id:${id} time: ${time}`);
    try {
      const ticket = await locker.lock(); // lock必须加await
      thisResult.push({ id, time, op: 'in-lock' });
      // console.log(`[in-lock] id:${id} time: ${time}`);
      await wait(time);
      thisResult.push({ id, time, op: 'out-lock' });
      // console.log(`[out-lock] id:${id} time: ${time}`);
      await locker.unlock(ticket); // unlock加不加await都可
      thisResult.push({ id, time, op: 'end' });
      // console.log(`[end] id:${id} time: ${time}`);
      if (done) {
        stopLog = true;
        done();
      }
    } catch (e: any) {
      if (stopLog || e.name === 'JestAssertionError') {
        throw e;
      }
      thisResult.push({ id, time, op: 'err: ' + e.name || e });
      // console.error(`[ERROR] id:${id} time: ${time}\n`, e);
      // throw e
      // if (done) { done() }
    }
  };
  const exceptArray = (excepted: any[], value: any[]) => {
    // console.log(excepted)
    const exceptStr = JSON.stringify(excepted);
    const valueStr = JSON.stringify(value);
    if (exceptStr !== valueStr) {
      console.log('except: ', excepted);
      console.log('tobe: ', value);
    }
    expect(exceptStr).toBe(valueStr);
  };
  const doneAndCheck = (done: CallableFunction, compared: any[]) => () => {
    // expect(result).toEqualArray()
    // console.log(result)
    exceptArray(result, compared);
    done();
  };

  test('Single Locker Simple Test', (done) => {
    const testLocker = makeLocker();
    const compared = [
      { id: 10001, time: 100, op: 'start' },
      { id: 10001, time: 100, op: 'in-lock' },
      { id: 10001, time: 100, op: 'out-lock' },
      { id: 10001, time: 100, op: 'end' },
    ];
    const runTest = async () => {
      testFunc(testLocker, 100, doneAndCheck(done, compared));
    };
    expect.assertions(1);
    runTest();
  });

  test('Single Locker Serial Test', (done) => {
    const testLocker = makeLocker();
    const compared = [
      { id: 10001, time: 100, op: 'start' },
      { id: 10002, time: 100, op: 'start' },
      { id: 10003, time: 100, op: 'start' },
      { id: 10001, time: 100, op: 'in-lock' },
      { id: 10001, time: 100, op: 'out-lock' },
      { id: 10001, time: 100, op: 'end' },
      { id: 10002, time: 100, op: 'in-lock' },
      { id: 10002, time: 100, op: 'out-lock' },
      { id: 10002, time: 100, op: 'end' },
      { id: 10003, time: 100, op: 'in-lock' },
      { id: 10003, time: 100, op: 'out-lock' },
      { id: 10003, time: 100, op: 'end' },
    ];
    expect.assertions(1);
    const runTest = async () => {
      testFunc(testLocker, 100);
      testFunc(testLocker, 100);
      testFunc(testLocker, 100, doneAndCheck(done, compared));
    };

    runTest();
  });

  test('Single Locker Complex Test', (done) => {
    const testLocker = makeLocker();
    const compared = [
      { id: 10001, time: 300, op: 'start' },
      { id: 10002, time: 301, op: 'start' },
      { id: 10003, time: 302, op: 'start' },
      { id: 10001, time: 300, op: 'in-lock' },
      { id: 10001, time: 300, op: 'out-lock' },
      { id: 10001, time: 300, op: 'end' },
      { id: 10002, time: 301, op: 'in-lock' },
      { id: 10004, time: 300, op: 'start' },
      { id: 10002, time: 301, op: 'out-lock' },
      { id: 10002, time: 301, op: 'end' },
      { id: 10003, time: 302, op: 'in-lock' },
      { id: 10003, time: 302, op: 'out-lock' },
      { id: 10003, time: 302, op: 'end' },
      { id: 10004, time: 300, op: 'in-lock' },
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
      { id: 10006, time: 300, op: 'end' },
      { id: 10007, time: 300, op: 'in-lock' },
      { id: 10007, time: 300, op: 'out-lock' },
      { id: 10007, time: 300, op: 'end' },
      { id: 10008, time: 300, op: 'in-lock' },
      { id: 10008, time: 300, op: 'out-lock' },
      { id: 10008, time: 300, op: 'end' },
      { id: 10009, time: 300, op: 'in-lock' },
      { id: 10009, time: 300, op: 'out-lock' },
      { id: 10009, time: 300, op: 'end' },
    ];
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
    };

    expect.assertions(1);
    runTest();
  });

  test('Test Timeout', (done) => {
    const testLocker = makeLocker({
      timeout: 500,
      continueExcute: false,
    });
    const compared = [
      { id: 10001, time: 100, op: 'start' },
      { id: 10002, time: 1000, op: 'start' },
      { id: 10003, time: 300, op: 'start' },
      { id: 10004, time: 300, op: 'start' },
      { id: 10005, time: 300, op: 'start' },
      { id: 10006, time: 300, op: 'start' },
      { id: 10007, time: 100, op: 'start' },
      { id: 10001, time: 100, op: 'in-lock' },
      { id: 10001, time: 100, op: 'out-lock' },
      { id: 10001, time: 100, op: 'end' },
      { id: 10002, time: 1000, op: 'in-lock' },
      { id: 10003, time: 300, op: 'in-lock' },
      { id: 10003, time: 300, op: 'out-lock' },
      { id: 10003, time: 300, op: 'end' },
      { id: 10004, time: 300, op: 'in-lock' },
      { id: 10002, time: 1000, op: 'out-lock' },
      { id: 10002, time: 1000, op: 'err: TicketUnvalidError' },
      { id: 10004, time: 300, op: 'out-lock' },
      { id: 10004, time: 300, op: 'end' },
      { id: 10005, time: 300, op: 'in-lock' },
      { id: 10005, time: 300, op: 'out-lock' },
      { id: 10005, time: 300, op: 'end' },
      { id: 10006, time: 300, op: 'in-lock' },
      { id: 10006, time: 300, op: 'out-lock' },
      { id: 10006, time: 300, op: 'end' },
      { id: 10007, time: 100, op: 'in-lock' },
      { id: 10007, time: 100, op: 'out-lock' },
      { id: 10007, time: 100, op: 'end' },
    ];
    expect.assertions(1);
    const runTest = async () => {
      testFunc(testLocker, 100);
      testFunc(testLocker, 1000);
      testFunc(testLocker, 300);
      testFunc(testLocker, 300);
      testFunc(testLocker, 300);
      testFunc(testLocker, 300);
      testFunc(testLocker, 100, doneAndCheck(done, compared));
    };

    runTest();
  });
});
