# front-lock
An useful async lock🔐 for frontend (web). 

_No need for Database._

Also available on node.js.
(But it doesn't work on the node.js program who use  multi-process)

[中文文档](https://github.com/winrey/front-lock/blob/main/README.zh.md)

## Install
```bash
npm install front-lock
```
or
```bash
yarn add front-lock
```

## Usage
### lock
___RECOMMEND___  
Simple to use:
```javascript
import { lock } from 'front-lock'

lock("lock-name", async () => {
    // Do something async in the lock
    if (!userInfo) {
      userInfo = await login()
    }

})
```
Do something after lock:
```javascript
import { lock } from 'front-lock'

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
import { lock } from 'front-lock'

(async () => {
  const value = await lock("lock-name", async () => {
      // Do something async in lock
      return await 123
  })
  console.log(value)
  // > 123
})()
```
If you have difficult to name it, you can use symbol:
```javascript
import { lock } from 'front-lock'

lock(Symbol(), new Promise(resolve => {
  // You can also use Promise here
  resolve(123)
}))
```
Also support to set timeout
```javascript
import {
  lock, wait, Lock,
  TicketUnvalidError
} from 'front-lock'

// You can also use Lock to create lock
const myLock = new Lock()

lock(myLock, async () => {
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

### Lock
If you want to more flexible, you can use `Lock` class directly. See more details in the code. 
```javascript
import {
  wait, Lock,
} from 'front-lock'

// You can also use lock to create lock
const lock = new Lock()

(async () => {
  // At the start of the async code you need to lock
  const ticket = await lock.lock()
  // you can also set timeout here
  // const ticket = await lock.lock(5000)
  try {
    // do something async
    // .......
    await wait(1000)
  } finally {
    // At the end of the code you need to lock
    // you should make sure the unlock function will run in any situation, or set a timeout.
    await lock.unlock(ticket)
  }


})()

```
## todo
* [x] Trans to Typescript
* [x] Write Test
* [x] Test Multi-lock Situation
* [x] Add Timeout
* [x] Test Timeout
* [x] Test Error
* [ ] Support Worker

