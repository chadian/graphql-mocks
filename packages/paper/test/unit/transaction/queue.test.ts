import { expect } from 'chai';
import { Queue } from '../../../src/transaction/queue';

describe('transaction/queue', () => {
  it('provides methods to wait in queue', async () => {
    const queue = new Queue();
    const { previous: previousOne, finish: finishOne } = queue.enqueue();
    const { previous: previousTwo } = queue.enqueue();

    let previousTwoCleared = false;

    previousTwo.then(() => {
      previousTwoCleared = true;
    });

    expect(previousTwoCleared).to.equal(false);
    await previousOne;
    expect(previousTwoCleared).to.equal(false);
    finishOne();

    await previousTwo;
    expect(previousTwoCleared).to.equal(true);
  });
});
