export class Queue {
  private chain: Promise<void> = Promise.resolve();

  enqueue(): { previous: Promise<void>; finish: () => void } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let finish: any;

    const link = new Promise((resolve) => {
      finish = resolve;
    });

    const previous = this.chain;

    this.chain = this.chain.then(async () => {
      await link;
    });

    return { previous, finish };
  }
}
