const {createPupa, CrawlerMode} = require('../build/src/index');

createPupa()
  .setMode(CrawlerMode.CHEERIO)
  .setRequest(['https://www.baidu.com', 'https://www.qq.com'])
  .setPageOperateData(($, chunk) => {
    console.log('=================');
    console.log(chunk.toString());
    console.log($('link'));
  })
  .build()
  .run();


