const {createPupa, CrawlerMode, CheerioBuild} = require('../build/src/index');
// const {CheerioCrawler} = require('../build/src/crawler/cheerio_crawler');

describe('createPupa', () => {
  describe('setMode', () => {
    test('function return result verification', () => {
      const result = createPupa().setMode(CrawlerMode.CHEERIO);
      expect(result).toEqual(new CheerioBuild());
    });

    test('function return result null', () => {
      const result = createPupa().setMode(1000);
      expect(result).toBeNull();
    });
  });

});
