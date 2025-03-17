import { describe, expect, test, it } from "vitest";
import { Sum } from "shared/index";
import { MinHeap } from "../index";

const createNode = (id: number, sortIndex: number) => ({
  id,
  sortIndex,
});
describe("scheduler", () => {
  test("test", () => {
    expect(Sum(1, 2)).toBe(3);
  });
});

describe("test min heap", () => {
  it("empty heap return null", () => {
    const heap = new MinHeap();
    expect(heap.peek()).toBeNull();
  });

  it("push node", () => {
    const heap = new MinHeap();
    heap.push(createNode(2, 2));
    heap.push(createNode(3, 3));
    heap.push(createNode(4, 4));
    const node = createNode(1, 1);
    heap.push(node);
    expect(heap.peek()).toBe(node);
  });

  it("pop node", () => {
    const heap = new MinHeap();
    const node = createNode(1, 1);
    heap.push(createNode(2, 2));
    heap.push(createNode(3, 3));
    heap.push(createNode(4, 4));
    heap.push(node);
    expect(heap.pop()).toBe(node);
  });
});
