# react-dnd-demo

> 这是一个react-dnd的demo，实现了sort，handler等功能

[查看React Dnd文档](https://react-dnd.github.io/react-dnd/about)

## Install

```
yarn
```

## Usage

```
yarn dev
```

[然后打开网页进入http://localhost:3000/examples/rule-mapping](http://localhost:3000/examples/rule-mapping)

## Thinking

这里说一下我学到的东西

* 使用[immutability-helper](https://github.com/kolodny/immutability-helper)

  简单介绍下，对于immutable.js，我们可能只是想要其数据不可变的功能而已，对于其他的其实用的很少，
  而immutability-helper简化了immutable的用法，方便我们使用。

  ````
  const pushArray = update(initialArray, { $push: ['f'] });
  const unshiftArray = update(initialArray, { $unshift: ['f'] });
  const spliceArray = update(initialArray, { $splice: [[1, 2], [2, 0, 'f', 'g']] });

  const setArray = update(initialArray, { 1: { $set: 'f' } });
  const setObject = update(initialObject, { age: { $set: 26 } });

  const unsetObject = update(initialObject, { $unset: ['name', 'gender'] });

  const mergeObject = bupdate(initialObject, { $merge: { name: 'Rose', gender: 'Woman', hobby: 'Swimming' } });

  /**
  * API: {$apply: function}
  * 为目标数组或者对象中某个下标或者属性应用 function
  */
  const apply = (val) => val + '--apply'
  // 为 initialArray 数组中下标为 1 的元素执行 apply 函数
  const applyArray = update(initialArray, { 1: { $apply: apply } });
  console.log('applyArray：', applyArray);    // => [ 'a', 'b--apply', 'c', 'd', 'e' ]

  // 为 initialObject 对象中 name 属性执行 apply 函数
  const applyObject = update(initialObject, { name: { $apply: apply } });
  console.log('applyObject：', applyObject);  // => { name: 'Jack--apply', age: 22, gender: 'Man' }
  ````

* 关于如何使用React Dnd

  对于SSR应用来说，因为是用于服务端，所以使用`react-dnd-cjs`和`react-dnd-html5-backend-cjs`

* 关于React Dnd如何实现拖拽更换位置

  通过比较拖拽的物体和目标之间的id是否相同来判断是否应该交换位置

  ````
  const [, drop] = useDrop({
    accept: ItemTypes.HANDLE_WRAPPER,
    canDrop: () => false,
    hover({ id: draggedId }) {
      if (draggedId !== id) {
        const { index: overIndex } = findRule(id)
        moveRule(draggedId, overIndex)
      }
    },
  })
  ````

* 通过requestAnimationFrame来优化性能

  ````
  this.drawFrame = () => {
    const nextState = update(this.state, this.pendingUpdateFn)
    this.setState(nextState)
    this.pendingUpdateFn = undefined
    this.requestedFrame = undefined
  }

  scheduleUpdate(updateFn) {
    this.pendingUpdateFn = updateFn
    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(this.drawFrame)
    }
  }

  componentWillUnmount() {
    if (this.requestedFrame !== undefined) {
      cancelAnimationFrame(this.requestedFrame)
    }
  }
  ````


