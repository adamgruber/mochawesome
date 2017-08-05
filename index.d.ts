declare function addContext(testObj: object, context: string | mochawesome.TestContext): void;

declare namespace mochawesome {
  interface TestContext {
    title: string;
    value: any;
  }
}

declare namespace addContext { }

declare module 'mochawesome/addContext' {
  export = addContext;
}
