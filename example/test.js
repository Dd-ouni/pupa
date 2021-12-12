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

createPupa(CrawlerMode.CHEERIO)
  .setRequest(['http://localhost:8000/', 'http://localhost:8000/'])
  .setHeaders({
    'cookie': '123',
    'host': 'www.baidu.com'
  })
  .setPageOperateComplete(({ $, chunk }) => {
    console.log('=================');
    console.log(chunk.toString());
    console.log($('link'));
  })
  .build()
  .run();



