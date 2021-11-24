const {createPupa, CrawlerMode, CheerioBuild} = require('../build/src/index');
const {Server} = require('../build/src/server/index');

const localhost = 'http://127.0.0.1:8000/';

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

  describe('run', () => {
    beforeAll(async () => {
      this.server = await Server.run(8000);
    });
    beforeEach(() => {
      this.server.reset();
    });
    afterAll(() => {
      this.server.stop();
    });
    test('check crawling results', done => {
      this.server.setContent('/', `<h1>Hello world!</h1>`);
      createPupa()
        .setMode(CrawlerMode.CHEERIO)
        .setRequest(localhost)
        .setPageOperateData(($, chunk) => {
          try {
            expect(chunk.toString()).toBe(`<h1>Hello world!</h1>`);
            done();
          } catch (error) {
            done(error);
          }
        })
        .build()
        .run()
        .end()
    });
  });
});
