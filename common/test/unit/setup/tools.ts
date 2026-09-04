export interface TestTools {
  act(callback: () => void | Promise<void>): Promise<void>;
}

export const defaultTestTools: TestTools = {
  async act(callback) {
    await callback();
  }
};
