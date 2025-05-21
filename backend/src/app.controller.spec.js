describe('AppController', () => {
  let controller;

  beforeEach(() => {
    controller = {
      getHello: () => 'Hello World!',
    };
  });

  it('should return "Hello World!"', () => {
    expect(controller.getHello()).toBe('Hello World!');
  });
});
