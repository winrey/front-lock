# front-locker
An userful async locker🔐 for frontend (web). 

_No need for Database._

Also available on node.js.
(But it doesn't work on the node.js program who use  multi-process)

[中文文档](https://github.com/winrey/front-locker/blob/main/README.zh.md)

## Install
```bash
npm install front-locker
```
or
```bash
yarn add front-locker
```

## Usage
### lock
___RECOMMEND___  
Simple to use:
```javascript
import { lock } from 'front-locker'

lock("locker-name", async () => {
    // Do something async in the lock
    if (!userInfo) {
      userInfo = await login()
    }

})
```
Do something after lock:
```javascript
import { lock } from 'front-locker'

lock("another-lock-name", async () => {
  // Do something async in lock
  await xxxx
}).then(() => {
  // Do something after lock
  // ...
}).catch(err => {
  // catch error in lock (and function provided in lock)
  // ...
})
```
If you need the return value (and you can also use await):
```javascript
import { lock } from 'front-locker'

(async () => {
  const value = await lock("locker-name", async () => {
      // Do something async in lock
      return await 123
  })
  console.log(value)
  // > 123
})()
```
If you have difficult to name it, you can use symbol:
```javascript
import { lock } from 'front-locker'

lock(Symbol(), new Promise(resolve => {
  // You can also use Promise here
  resolve(123)
}))
```
Also support to set timeout
```javascript
import {
  lock, wait, Locker,
  LockerTimeoutError, 
  TicketUnvalidError
} from 'front-locker'

// You can also use locker to create lock
const locker = new Locker()

lock(locker, async () => {
    // Do something async in lock
    wait(2000)
}, { timeout: 1000, continueExcute: false }).catch(err => {
  if (err instanceof TicketUnvalidError) {
    // handle this timeout Error when lock function return (if you set {continueExcute: false})
    // ......
  }
  // handle other Error
  // ......
})
```

### Locker
If you want to more flexible, you can use `Locker` class directly. See more details in the code. 
```javascript
import {
  wait, Locker,
  LockerTimeoutError, 
  TicketUnvalidError
} from 'front-locker'

// You can also use locker to create lock
const locker = new Locker()

(async () => {
  // At the start of the async code you need to lock
  const ticket = await locker.lock()
  // you can also set timeout here
  // const ticket = await locker.lock(5000)
  try {
    // do something async
    // .......
    await wait(1000)
  } finally {
    // At the end of the code you need to lock
    // you should make sure the unlock function will run in any situation, or set a timeout.
    await locker.unlock(ticket)
  }


})()

```
## todo
* [x] Trans to Typescript
* [x] Write Test
* [ ] Test Multi-locker Situation
* [x] Add Timeout
* [ ] Test Timeout
* [ ] Test Error
* [ ] Support Worker

