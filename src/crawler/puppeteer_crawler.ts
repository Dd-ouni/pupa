import {BasicCrawler} from './basic_crawler';

export class PuppeteerCarwler extends BasicCrawler {
  private option: any;
  run() {
    console.log('PuppeteerCarwler run()');
    return this;
  }

  end() {
    return new Promise(resolve => {
      this.option.queueEndConventions = resolve;
    });
  }
}
