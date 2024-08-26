import { events } from "./events"

export function MenuDragger(containerRef, data) {
    let currentComponent = null // 当前拖拽的组件
    // 拖拽事件
    const dragStart = (e, component) => {
        // dragenter进入元素中, 添加一个移动标识
        // dragover在元素中移动 必须阻止默认事件, 否则无法触发drop
        // dragleave 离开元素的时候 需要增加一个禁用标识
        // drop 释放元素的时候, 就是松手的时候, 需要获取到位置, 并且添加组件到容器中
        containerRef.value.addEventListener('dragenter', dragEnter)
        containerRef.value.addEventListener('dragover', dragOver)
        containerRef.value.addEventListener("dragleave", dragLeave)
        containerRef.value.addEventListener("drop", drop)
        currentComponent = component
        console.log("", currentComponent)
        events.emit('srart') // 发布start
    }

    const dragEnd = (e) => {
        containerRef.value.removeEventListener('dragenter', dragEnter)
        containerRef.value.removeEventListener('dragover', dragOver)
        containerRef.value.removeEventListener("dragleave", dragLeave)
        containerRef.value.removeEventListener("drop", drop)
        events.emit('end') // 发布end
    }
    const dragEnter = (e) => {
        // 移入容器中改变样式, H5的拖动图标
        e.dataTransfer.dropEffect = "move";
    }
    const dragOver = (e) => {
        // 在容器中移动阻止默认行为
        e.preventDefault();
    }
    const dragLeave = (e) => {
        // 离开容器中改变样式
        e.dataTransfer.dropEffect = "none";
    }
    const drop = (e) => {
        // 松手释放元素, 获取位置, 并且增加当前组件到容器中
        let blocks = data.value.blocks;
        data.value = {
            ...data.value, blocks: [
                ...blocks,
                {
                    top: e.offsetY,
                    left: e.offsetX,
                    Zindex: 1,
                    key: currentComponent.key,
                    alignCenter: true
                }
            ]
        }
        currentComponent = null;
    }
    return {
        dragStart, dragEnd
    }
}