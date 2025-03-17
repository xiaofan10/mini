class myPromise {
  constructor(executor) {
    this.status = "pending";
    this.fullStack = [];
    this.rejectStack = [];

    if (typeof executor !== "function") {
      throw new Error("executor must be a function");
    }
    const resolve = (resolveValue) => {
      this.status = "fulfilled";
      let returnValue = resolveValue;
      this.fullStack.forEach((fn) => {
        returnValue = fn(resolveValue);
      });
    };
    const reject = (rejectValue) => {
      this.status = "rejected";
      this.rejectStack.forEach((fn) => {
        fn(rejectValue);
      });
    };
    executor(resolve, reject);
  }
  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== "function") {
      throw new Error("onFulfilled must be a function");
    }

    return new myPromise((resolve, reject) => {
      const handle = (callback, value) => {
        setTimeout(() => {
          const x = callback(value);
          if (x instanceof myPromise) {
            x.then(resolve, reject);
          } else {
            resolve(x);
          }
        }, 0);
      };

      this.fullStack.push(() => handle(onFulfilled, this.value));
      if (onRejected && typeof onRejected === "function") {
        this.rejectStack.push(() => handle(onRejected, this.value));
      }
    });
  }
}
