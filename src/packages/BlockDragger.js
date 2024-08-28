import { reactive } from "vue"

export default function BlockDragger(focusData, lastSelectBlock, data) {
    let dragState = {
        startX: 0,
        startY: 0
    }
    let markline = reactive({
        x: null,
        y: null,
    })
    const mousedown = (e) => {
        const { width: Bwidth, height: Bheight } = lastSelectBlock.value //拖拽的元素

        // 记录鼠标按下时的位置
        dragState = {
            startX: e.clientX,
            startY: e.clientY, //记录每一个选中的位置

            startLeft: lastSelectBlock.value.left, // 拖拽前的位置
            startTop: lastSelectBlock.value.top,

            statrPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
            lines: (() => {
                const { unfocus } = focusData.value
                let lines = { x: [], y: [] }; // 计算横线的位置使用y存放, x存放纵线
                [...unfocus, {
                    top:0,
                    left:0,
                    width: data.value.container.width+"%",
                    height: data.value.container.height+"%",
                }].forEach((block) => {
                    const { top: Atop, left: Aleft, width: Awidth, height: Aheight } = block;
                    lines.y.push({ showTop: Atop, top: Atop }); // 上线
                    lines.y.push({ showTop: Atop, top: Atop - Bheight }); // 底对顶
                    lines.y.push({ showTop: Atop + Aheight / 2, top: Atop + Aheight / 2 - Bheight / 2 }); // 中线
                    lines.y.push({ showTop: Atop + Aheight, top: Atop + Aheight }); // 底对顶;
                    lines.y.push({ showTop: Atop + Aheight, top: Atop + Aheight - Bheight  }); // 底对底

                    lines.x.push({ showLeft: Aleft, left: Aleft }); // 左对左
                    lines.x.push({ showLeft: Aleft + Awidth, left: Aleft + Awidth }); // 右对左
                    lines.x.push({ showLeft: Aleft + Awidth / 2, left: Aleft + Awidth / 2 - Bwidth / 2 }); // 中线
                    lines.x.push({ showLeft: Aleft + Awidth, left: Aleft + Awidth - Bwidth });
                    lines.x.push({ showLeft: Aleft, left: Aleft - Bwidth }); // 左对右
                })
                return lines;
            })()
        }

        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
    const mousemove = (e) => {
        let { clientX: moveX, clientY: moveY } = e; // 解构赋值

        // 计算当前元素最新的left和top, 查找线, 并显示
        // 鼠标移动后 - 鼠标移动前 + left 
        let left = moveX - dragState.startX + dragState.startLeft
        let top = moveY - dragState.startY + dragState.startTop

        // 计算横线, 距离参照值多少像素时候, 进行显示指定的线
        let y = null
        let x = null
        for (let i = 0; i < dragState.lines.y.length; i++) {
            const { top: t, showTop: s } = dragState.lines.y[i] //获取每一条线
            if (Math.abs(t - top) < 5) { // 距离小于5像素, 显示
                y = s //线要显示的位置
                // 实现快速和元素贴在一起
                moveY = dragState.startY - dragState.startTop + t //容器距离顶部的距离 + 目标的高度
                break; // 找到就退出循环
            }
        }
        for (let i = 0; i < dragState.lines.x.length; i++) {
            const { left: l, showLeft: s } = dragState.lines.x[i] //获取每一条线
            if (Math.abs(l - left) < 5) { // 距离小于5像素, 显示
                x = s //线要显示的位置
                // 实现快速和元素贴在一起
                moveX = dragState.startX - dragState.startLeft + l //容器距离顶部的距离 + 目标的高度
                break; // 找到就退出循环
            }
        }
        markline.x = x; // markline是响应式数据, x, y 更新, 页面就会更新
        markline.y = y;

        let durX = moveX - dragState.startX; // 之前和之后的距离
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
        markline.x = null;
        markline.y = null;
    }
    return {
        mousedown,
        markline
    }
}