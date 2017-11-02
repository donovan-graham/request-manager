import fetch from 'node-fetch';

class RequestManager {
  constructor() {
    this.history = {};
    this.pendingCounter = 0;
    this.rejectedCounter = 0;
    this.resolvedCounter = 0;
  }

  debug() {
    console.log('pending: ', this.pendingCounter);
    console.log('rejected: ', this.rejectedCounter);
    console.log('resolved: ', this.resolvedCounter);
    // console.log('history: ', this.history);
  }

  fetch(url) {
    if (!(url in this.history)) {
      this.pendingCounter++;
      this.history[url] = fetch(url)
        .then(
          r => {
            this.pendingCounter--;
            this.resolvedCounter++;
            return r;
          },
          e => {
            this.pendingCounter--;
            this.rejectedCounter++;
            throw e;
          }
        )
        .then(r => r.json());
    }
    return this.history[url];
  }
}

const rm = new RequestManager();

const url1 = 'https://api.github.com/repos/donovan-graham/victory-chart/commits';
const url2 = 'https://api.github.com/repos/donovan-graham/request-manager/commits';
const url3 = 'broken://url';

Promise.all([url1, url1].map(url => rm.fetch(url)))
  .then(results => {
    console.log('--- start: first block ---');
    results.map((result, i) => console.log(`${i}: ${result[0].url}`));
    console.log('--- end: first block ---');
  })
  .catch(e => console.lsog('oops 1', e));

Promise.all([url1, url2].map(url => rm.fetch(url)))
  .then(results => {
    console.log('--- start: second block ---');
    results.map((result, i) => console.log(`${i}: ${result[0].url}`));
    console.log('--- end: second block ---');
  })
  .catch(e => console.log('oops 2', e));

Promise.all([url1, url2, url3].map(url => rm.fetch(url)))
  .then(results => {
    console.log('--- start: third block ---');
    results.map((result, i) => console.log(`${i}: ${result[0].url}`));
    console.log('--- end: third block ---');
  })
  .catch(e => console.log('oops 3', e));

Promise.all(Object.values(rm.history))
  .then(() => rm.debug())
  .catch(() => rm.debug());

rm.debug();
