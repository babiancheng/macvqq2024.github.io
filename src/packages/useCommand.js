import deepcopy from "deepcopy";
import { events } from "./events";
import { onUnmounted } from "vue";
// 4444
export function useCommand(data) {
    const state = { // 前进后退需要索引值
        current: -1, // 前进后退的索引值
        queue: [], // 存放所有的操作命令
        commands: {}, // 制作命令和执行功能的一个映射表
        commandArray: [], // 存放所有的命令
        destrotArray: [], // 存放所有的销毁函数
    }
    const registry = (command) => {
        state.commandArray.push(command);
        state.commands[command.name] = () => {
            const { redo, undo } = command.execute()
            redo()
            if (!command.pushQueue) { // 不需要放到队列里直接跳过
                return
            }
            let { queue, current } = state

            if (queue.length > 0) {
                queue = queue.splice(0, current + 1)
                this.queue = queue
            }


            queue.push({ redo, undo })// 保存指定的前进后退
            state.current = current + 1
            console.log(state.queue);

        }
    }
    registry({
        name: 'redo',
        keyboard: 'ctrl+y',
        execute() {
            return {
                redo() {
                    console.log('前进'); // 执行前进
                    let item = state.queue[state.current + 1]
                    if (item) {
                        item.redo && item.redo()
                        state.current++;
                    }
                }
            }
        }
    })
    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        execute() {
            return {
                redo() {
                    console.log('后退');
                    if (state.current === -1) return; // 没有可撤销的
                    let item = state.queue[state.current]
                    if (item) {
                        item.undo && item.undo()
                        state.current--;
                    }

                }
            }
        }
    });
    registry({ // 如果希望将操作放到队列中可以增加一个属性 标识，等会操作要放到队列中
        name: 'drag',
        pushQueue: true,
        init() {// 初始化
            this.before = null
            // 监控拖拽开始事件，保存状态
            const srart = () => this.before = deepcopy(data.value.blocks)
            // 拖拽之后需要触发对应的指令
            const end = () => state.commands.drag()
            events.on('start', srart)
            events.on('end', end)
            return () => {
                events.off('start', srart)
                events.off('end', end)
            }

        },
        execute() {
            let before = this.before
            let after = data.value.blocks // 之后的状态
            return {
                redo() { // 默认一松手就把当前的事情做了
                    data.value = { ...data.value, blocks: after }
                },
                undo() { // 前一步的
                    data.value = { ...data.value, blocks: before }
                }
            }
        }
    });
    (() => {
        state.commandArray.forEach(command => command.init && state.destrotArray.push(command.init()))
    })();
    onUnmounted(() => {// 清理绑定的事件
        state.destrotArray.forEach(fn => fn && fn())
    })
    return state;
}