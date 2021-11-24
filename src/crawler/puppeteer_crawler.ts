import {AbstractCrawler} from './abstract_crawler';

export class PuppeteerCarwler extends AbstractCrawler {
  run() {
    console.log('PuppeteerCarwler run()');
    return this;
  }

  end() {
    return new Promise(resolve => {
      resolve(true);
    });
  }
}
