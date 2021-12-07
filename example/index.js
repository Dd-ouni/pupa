const {createPupa, CrawlerMode} = require('../build/src/index');

createPupa(CrawlerMode.CHEERIO)
  .setRequest(['https://www.baidu.com', 'https://www.qq.com'])
  .setPageOperateComplete(({ $, chunk }) => {
    console.log('=================');
    console.log(chunk.toString());
    console.log($('link'));
  })
  .build()
  .run();

