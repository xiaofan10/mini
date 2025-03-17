// 实现任务调度算法
// 二叉树：最多有两个子节点 由父节点下标可以推出子节点的下标 父节点下标为i，左子节点下标为2i+1，右子节点下标为2i+2
// 满二叉树 2^h - 1 h为树的高度
// 完全二叉树：除了最后一层外，每一层都是满的，并且最后一层的节点都靠左排列

// 最小堆：是一种经过排序的完全二叉树。父节点的值小于等于子节点的值，即每个节点的值都小于等于其子节点的值
export type Node = {
  id: number; // 任务id
  sortIndex: number; // 排序一句
};

function compare(a: Node, b: Node) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id; // 如果排序值相同，则按照id排序
}

function peek<T extends Node>(heap: Heap<T>): T | null {
  return heap[0] || null;
}

function push<T extends Node>(heap: Heap<T>, node: T) {
  // 将元素添加到堆的末尾
  // 插入元素是往上调整的过程
  heap.push(node);
  if (heap.length === 1) {
    return;
  }
  let index = heap.length - 1;
  while (index > 0) {
    const parentIndex = Math.floor((index - 1) / 2);
    const parent = heap[parentIndex];
    const current = heap[index];
    if (compare(parent, current) > 0) {
      heap[parentIndex] = current;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}
function pop<T extends Node>(heap: Heap<T>): T | null {
  // 删除堆顶元素，将堆的最后一个元素放到堆顶，然后向下调整
  if (heap.length <= 1) {
    return heap[0] || null;
  }
  if (heap.length === 2) {
    return heap.shift()!;
  }
  const cur = heap[0];
  const last = heap.pop();
  heap[0] = last!;
  let index = 0;
  while (index < heap.length / 2) {
    const leftIndex = 2 * index + 1;
    const rightIndex = 2 * index + 2;
    const left = heap[leftIndex];
    const right = heap[rightIndex];
    let cur = heap[index];
    if (!left && !right) {
      break;
    }
    if (!right) {
      if (compare(left, cur) < 0) {
        heap[leftIndex] = cur;
        heap[index] = left;
        index = leftIndex;
        cur = left;
      } else {
        break;
      }
    }

    if (compare(left, right) < 0) {
      if (compare(left, cur) < 0) {
        heap[leftIndex] = cur;
        heap[index] = left;
        index = leftIndex;
        cur = left;
      } else {
        break;
      }
    } else {
      if (compare(right, cur) < 0) {
        heap[rightIndex] = cur;
        heap[index] = right;
        index = rightIndex;
        cur = right;
      } else {
        break;
      }
    }
  }

  return cur;
}
export type Heap<T extends Node> = Array<T>;
class MinHeap {
  private heap: Heap<Node> = [];

  public fromParentToChildIndex(i) {
    return [2 * i + 1, 2 * i + 2];
  }
  public compare(a: Node, b: Node) {
    const diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id; // 如果排序值相同，则按照id排序
  }
  // 获取堆顶元素
  public peek(): Node | null {
    return this.heap[0] || null;
  }
  // 删除堆顶元素
  public pop(): Node | null {
    // 删除堆顶元素，将堆的最后一个元素放到堆顶，然后向下调整
    if (this.heap.length <= 1) {
      return this.heap[0] || null;
    }
    if (this.heap.length === 2) {
      return this.heap.shift()!;
    }
    const cur = this.heap[0];
    const last = this.heap.pop();
    this.heap[0] = last!;
    let index = 0;
    while (index < this.heap.length / 2) {
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      const left = this.heap[leftIndex];
      const right = this.heap[rightIndex];
      let cur = this.heap[index];
      if (!left && !right) {
        break;
      }
      if (!right) {
        if (this.compare(left, cur) < 0) {
          this.heap[leftIndex] = cur;
          this.heap[index] = left;
          index = leftIndex;
          cur = left;
        } else {
          break;
        }
      }

      if (this.compare(left, right) < 0) {
        if (this.compare(left, cur) < 0) {
          this.heap[leftIndex] = cur;
          this.heap[index] = left;
          index = leftIndex;
          cur = left;
        } else {
          break;
        }
      } else {
        if (this.compare(right, cur) < 0) {
          this.heap[rightIndex] = cur;
          this.heap[index] = right;
          index = rightIndex;
          cur = right;
        } else {
          break;
        }
      }
    }

    return cur;
  }
  // 给堆顶添加元素
  public push<T extends Node>(node: T) {
    // 将元素添加到堆的末尾
    // 插入元素是往上调整的过程
    this.heap.push(node);
    if (this.heap.length === 1) {
      return;
    }
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      const current = this.heap[index];
      if (this.compare(parent, current) > 0) {
        this.heap[parentIndex] = current;
        this.heap[index] = parent;
        index = parentIndex;
      } else {
        return;
      }
    }
  }
}

export { MinHeap, peek, pop, push };
