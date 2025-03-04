import deepcopy from "deepcopy";
import eventBus from "./events";
import { onUnmounted } from "vue";
//gbfdgwfdfvrdgvdvcfvcv
export function useCommand(data,focusData) {
  let state = {
    // 前进后退需要索引值
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作命令
    commands: {}, // 制作命令和执行功能的一个映射表
    commandArray: [], // 存放所有的命令
    destrotArray: [], // 存放所有的销毁函数
  };
  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args);
      redo();
      if (!command.pushQueue) {
        // 不需要放到队列里直接跳过
        return;
      }

      let { queue, current } = state;
      // 如果放了组件1 > 组件2 > 撤回 > 组件3
      // 组件1 > 组件3
      if (queue.length > 0) {
        // 可能在放置的过程中有撤回操作, 所以当前最新的current值来计算
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }
      queue.push({ redo, undo }); // 保存指定的前进后退
      state.current = current + 1;
      console.log(queue);
    };
  };
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute(newValue) {
      return {
        redo() {
          console.log("重做");
          let item = state.queue[state.current + 1]; //找到下一步还原
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });

  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          console.log("撤销");
          if (state.current === -1) return; // 没有可撤销的
          let item = state.queue[state.current]; // 找到上一步还原
          console.log(item);
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  registry({
    // 如果希望将操作放到队列中可以增加一个属性 标识，等会操作要放到队列中
    name: "drag",
    pushQueue: true,
    init() {
      // 初始化
      this.before = null;
      // 监控拖拽开始事件，保存状态
      const srart = () => {
        this.before = deepcopy(data.value.blocks);
      };

      // 拖拽之后需要触发对应的指令
      const end = () => {
        state.commands.drag();
      };

      // 拖拽之前
      eventBus.on("start", srart);
      // 拖拽之后
      eventBus.on("end", end);

      return () => {
        eventBus.off("start", srart);
        eventBus.off("end", end);
      };
    },

    execute() {
      let before = this.before;
      let after = data.value.blocks; // 之后的状态
      return {
        redo() {
          // 默认一松手就把当前的事情做了
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          // 前一步的
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  // 带有历史记录常用的模式
  registry({
    name: "updateContainer", // 更新整个容器
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value, // 当前的值
        after: newValue, // 新值
      };
      return {
        redo: () => {
          data.value = state.after;
        },
        undo: () => {
          data.value = state.before;
        },
      };
    },
  });
  registry({// 置顶操作
    name:'placeTop',
    pushQueue: true,
    execute(){
      let before=deepcopy(data.value.blocks)
      let after=(()=>{// 置顶就是在所有的block中找到最大的
        let {focus,unfocus}=focusData.value
        console.log(focus,unfocus);
        
        let maxZIndex=unfocus.reduce((prev,block)=>{
          return Math.max(prev,block.zIndex)
        },-Infinity)



        focus.forEach(block=>block.zIndex=maxZIndex+1) //让当前选中的比最大的+1 即可
        return data.value.blocks



      })();

      return {
        undo:()=>{
          // 如果当前blocks 前后一致 则不会更新
          data.value={...data.value,blocks:before}
        },
        redo:()=>{
          data.value={...data.value,blocks:after}
        }
      }
    }
  });
  registry({// 置低操作
    name:'placeBottom',
    pushQueue: true,
    execute(){
      let before=deepcopy(data.value.blocks)
      let after=(()=>{// 置顶就是在所有的block中找到最大的
        let {focus,unfocus}=focusData.value
        console.log(focus,unfocus);
        
        let minZIndex=unfocus.reduce((prev,block)=>{
          return Math.min(prev,block.zIndex)
        },Infinity)-1
        if(minZIndex<0){//这里如果是赋值则让没选中的向上 ，自己变成0
          const dur=Math.abs(minZIndex)
          minZIndex=0
          unfocus.forEach(block=>block.zIndex+=dur)
        }

        // 不能直接 -1 因为index 不能出现负值 负值就看不到组件了

        unfocus.forEach(block=>block.zIndex=minZIndex)//控制选中的值
        
        return data.value.blocks



      })();

      return {
        undo:()=>{
          // 如果当前blocks 前后一致 则不会更新
          data.value={...data.value,blocks:before}
        },
        redo:()=>{
          data.value={...data.value,blocks:after}
        }
      }
    }
  });
  (() => {
    state.commandArray.forEach(
      (command) => command.init && state.destrotArray.push(command.init())
    );
  })();
  onUnmounted(() => {
    // 清理绑定的事件
    state.destrotArray.forEach((fn) => fn && fn());
  });
  return state;
}
