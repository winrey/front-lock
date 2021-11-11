# front-locker
An userful async locker🔐 for frontend.
Also available on node.js.
(But it doesn't work on the node.js program who use  multi-process)

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
    // Do something async in lock
    await xxxx
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
}, { timeout: 1000 }).catch(err => {
  if (err instanceof LockerTimeoutError) {
    // handle this timeout Error when timeout just happened
    // ......
  }
  if (err instanceof TicketUnvalidError) {
    // handle this timeout Error when lock function return
    // ......
  }
  // handle other Error
  // ......
})
```

### Locker
If you want to more flexible, you can use `Locker` class directly. See more details in code 
## todo
* [x] Trans to Typescript
* [x] Write Test
* [ ] Test Multi-locker Situation
* [x] Add Timeout
* [ ] Test Timeout
* [ ] Test Error
* [ ] Support Worker

