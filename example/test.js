const {createPupa, CrawlerMode} = require('../build/src/index');

createPupa(CrawlerMode.CHEERIO)
  .setRequest("http://localhost:8000/")
  .setHeaders({
    Cookie: "123",
    Host: "www.baidu.com"
  })
  .setPageOperateComplete(({ $, chunk }) => {
    console.log('=================');
    console.log(chunk.toString());
    console.log($('link'));
  })
  .build()
  .run();



