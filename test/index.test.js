const {createPupa, CrawlerMode, CheerioBuild} = require('../build/src/index');
// const {CheerioCrawler} = require('../build/src/crawler/cheerio_crawler');

describe('createPupa', () => {
  describe('setMode', () => {
    test('calibration method returns the result is CrawlerMode.CHEERIO', () => {
      const result = createPupa().setMode(CrawlerMode.CHEERIO);
      expect(result).toEqual(new CheerioBuild());
    });

    test('calibration method returns the result is null', () => {
      const result = createPupa().setMode(1000);
      expect(result).toBeNull();
    });
  });

});
