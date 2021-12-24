const {createPupa, CrawlerMode} = require('../build/src/index');
// const UserAgent = require('user-agents');
// const { mergeDeepRight } = require('ramda');

// let a = { a: 12 };
// let b = { c: 13 };

// console.log(mergeDeepRight(a, b));
// console.log(b, a);

// console.log(new UserAgent().toString(), " ==1 ");
// console.log(new UserAgent().toString(), " ==2 ");
// console.log(JSON.stringify(userAgent.data, null, 2))
// 'http://localhost:8000/',
createPupa(CrawlerMode.CHEERIO)
  .setStorageExpired(1000)
  // .setDistributedStorage()
  .setRequest([
    {
      priority: 100,
      value: 'https://www.qq.com/',
    },
    'https://cn.bing.com/',
    'https://oa.zkteco.com/',
    {
      priority: 10,
      value: 'https://www.baidu.com/',
    },
  ])
  .setHeaders({
    cookie: '123',
  })
  .setPageOperateComplete(({$, chunk}) => {
    console.log('=================');
    // console.log(chunk.toString());
    // console.log($('link'));
  })
  .run();
