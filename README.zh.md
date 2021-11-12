# front-lock
一个好用的前端锁🔐

_不需要数据库支持_

可以用于小程序和Node.js（但由于目前没有共享数据库支持，暂时仅限单机单进程）

最低可以支持ES5  

## 安装
```bash
npm install front-lock
```
or
```bash
yarn add front-lock
```

## 应用场景
拿小程序举例，有的时候小程序一些操作需要完成登录鉴权  
```javascript
let token = null

const ensureLogin = async() => {
  if (!token) {
    const code = await wx.login()
    const token = await requestLoginToServer(code)
  }
  return token
}

async function operation1() {
  const token = await ensureLogin()
  await requestOp1ToServer(token)
}

async function operation2() {
  const token = await ensureLogin()
  await requestOp2ToServer(token)
}
```
如果operation1和operation2都需要在页面初始化调用，他们互相之间会形成竞争关系，导致重复调用wx.login和requestLoginToServer，并且互相覆盖token，造成不稳定。

这样会多次不必要的调用wx.login这个限制频率接口（限制频率为2*PV），被腾讯警告，降等级；如果服务器只接受单一的token，甚至会导致失败。

一种可行的做法是，建立全局事件，并且监听回调。但是这样无疑会不必要的增加代码复杂度。使用本库，只要略微修改ensureLogin函数即可解决。
```javascript
import { lock } from 'front-lock'

let token = null

// 这里随便起名，锁和锁之间不重复就行
const ensureLogin = lock("login lock", async() => {
  if (!token) {
    const code = await wx.login()
    const token = await requestLoginToServer(code)
  }
  return token
})

```
这段代码可以保证，每次在锁内只有一个函数在进入执行（或者等待异步返回），之后调用的函数会排队在前面的函数执行完成后，再进入锁内。

如果锁内抛出异常（Error），代码锁会自动解锁，从而防止死锁。你同样可以为锁内代码设置超时时间，防止丢包未返回的情况发生，造成死锁。


## 用法
### lock
___最推荐使用这个函数___  
简单易用：
```javascript
import { lock } from 'front-lock'

lock("lock-name", async () => {
  // 在这里做一些异步操作
  await xxxx
})
```
需要在锁内代码执行完成后继续执行：
```javascript
import { lock } from 'front-lock'

lock("another-lock-name", async () => {
  // 在这里做一些异步操作
  await xxxx
}).then(() => {
  // 在这里做一些锁后需要处理的内容
  // ...
}).catch(err => {
  // catch error in lock (and function provided in lock)
  // ...
})
```
如果你需要返回值（await 的用法也是支持的）:
```javascript
import { lock } from 'front-lock'

  // 既然用了await，记得要防止异步函数内哦
  const value = await lock("lock-name", async () => {
    // 在这里做一些异步操作
    return await 123
  })
  console.log(value)
  // > 123
```
如果你是起名废，用Symbol作为锁名也许能拯救你
```javascript
import { lock } from 'front-lock'

lock(Symbol(), new Promise(resolve => {
  // 锁内部也是支持Promise的
  resolve(123)
}))
```
你同样可以设置超时
```javascript
import {
  lock, wait, Lock,
  LockTimeoutError, 
  TicketUnvalidError
} from 'front-lock'

// You can also use lock to create lock
const myLock = new Lock()

lock(myLock, async () => {
    // 在这里做一些异步操作
    wait(2000)
    
    // continueExcute 这
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
如果你想要更加灵活的使用锁，你可以直接只用`Lock`类。用Lock类你可以直接控制锁内的队列，调用`lock.clear()`函数情况队列，或者调用`lock.release()`强制释放当前锁，更自由的实现逻辑
```javascript
import {
  wait, Lock,
  TicketUnvalidError
} from 'front-lock'

const myLock = new Lock()

(async () => {
  // At the start of the async code you need to lock
  const ticket = await myLock.lock()
  // you can also set timeout here
  // const ticket = await myLock.lock(5000)
  try {
    // do something async
    // .......
    await wait(1000)
  } finally {
    // At the end of the code you need to lock
    // you should make sure the unlock function will run in any situation, or set a timeout.
    await myLock.unlock(ticket)
  }


})()

```

