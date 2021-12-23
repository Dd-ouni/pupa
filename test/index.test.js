const {createPupa, CrawlerMode, CheerioBuild} = require('../build/src/index');
const {Server} = require('../build/src/server/index');

const localServerHost = 'http://127.0.0.1:8000/';

describe('createPupa', () => {

  describe('setMode', () => {
    test('calibration method returns the result is CrawlerMode.CHEERIO', () => {
      const result = createPupa(CrawlerMode.CHEERIO);
      expect(result).toEqual(new CheerioBuild());
    });

    test('calibration method returns the result is null', () => {
      const result = createPupa(1000);
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
      this.server.setContent('/', '<h1>Hello world!</h1>');
      createPupa(CrawlerMode.CHEERIO)
        .setRequest(localServerHost)
        .setPageOperateComplete(({$, chunk}) => {
          try {
            expect(chunk.toString()).toBe('<h1>Hello world!</h1>');
            done();
          } catch (error) {
            done(error);
          }
        })
        .run()
        .end();
    });

    test('check request headers', done => {
      this.server.setContent('/', (request) => {
        return request.headers.cookie;
      })
      createPupa(CrawlerMode.CHEERIO)
        .setRequest(localServerHost)
        .setHeaders({
          Cookie: "123",
        })
        .setPageOperateComplete(({chunk}) => {
          try {
            expect(chunk.toString()).toBe('123');
            done();
          } catch (error) {
            done(error);
          }
        })
        .run()
        .end();
    })
  });
});
