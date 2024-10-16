import { SnakeToCamelPipe } from './snake-to-camel.pipe';

describe('SnakeToCamelPipe', () => {
  it('create an instance', () => {
    const pipe = new SnakeToCamelPipe();
    expect(pipe).toBeTruthy();
  });
});
