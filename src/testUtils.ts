// declare global {
//   namespace jest {
//     interface Matchers<R> {
//       toEqualArray(array: Array<object>): R;
//     }
//   }
// }

// expect.extend({
//   toEqualArray(received: Array<object>, array: Array<object>) {
//     const pass = received.length === array.length
//     for (let i=0; i<Math.min(received.length, array.length); i++) {
//       if(expect.)
//     }
//     if (pass) {
//       return {
//         message: () =>
//           `expected ${received} not to be within range ${floor} - ${ceiling}`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () =>
//           `expected ${received} to be within range ${floor} - ${ceiling}`,
//         pass: false,
//       };
//     }
//   },
// });

export function exceptArray(excepted: any[], value: any[]) {
  expect(excepted).toBeInstanceOf(Array)
  expect(excepted.length).toBe(value.length)
  for (let i = 0; i < excepted.length; i++) {
    expect(excepted[i]).toEqual(value[i])
  }
}

export default {};
