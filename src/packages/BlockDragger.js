export default function BlockDragger(focusData) {
    let dragState = {
        startX: 0,
        startY: 0
    }
    const mousedown = (e) => {
        // 记录鼠标按下时的位置
        dragState = {
            startX: e.clientX,
            startY: e.clientY, //记录每一个选中的位置
            statrPos: focusData.value.focus.map(({ top, left }) => ({ top, left }))
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    const mousemove = (e) => {
        // 解构赋值
        let { clientX: moveX, clientY: moveY } = e;
        let durX = moveX - dragState.startX;
        let durY = moveY - dragState.startY;
        // 计算每一个选中的位置
        focusData.value.focus.forEach((block, index) => {
            block.top = dragState.statrPos[index].top + durY;
            block.left = dragState.statrPos[index].left + durX;
        })
    }
    // 鼠标抬起, 移除事件
    const mouseup = (e) => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
    }
    return {
        mousedown
    }
}