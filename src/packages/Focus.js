import { computed, ref } from "vue";
export function Focus(data, callback) {

    const selectIndex = ref(-1) // 被选中的元素的下标

    const lastSelectBlock = computed(() =>
        data.value.blocks[selectIndex.value] // 最后被选中的元素
    )

    // 计算出那些元素被选中, 那些元素没有被选中
    const focusData = computed(() => {
        let focus = [] // 被选中的元素
        let unfocus = [] // 没有被选中的元素
        data.value.blocks.forEach(block => (block.focus ? focus : unfocus).push(block))
        return { focus, unfocus }
    })
    const blockMouseDown = (e, block, index) => {
        e.preventDefault() // 阻止默认行为
        e.stopPropagation() // 阻止事件冒泡
        // 在block上添加一个属性, 表示当前元素被选中
        if (e.shiftKey) {
            if (focusData.value.focus.length <= 1) {
                block.focus = true; // 当只有一个节点被选中时候, 按住shift也不会切换选中状态
            } else {
                block.focus = !block.focus; // 如果按住shift键, 则切换当前元素选中状态
            }
        } else {
            if (!block.focus) {
                clearblockFocus()
                block.focus = true; // 设置当前元素被选中, 清空其他元素
            } // 当已经自己被选中了, 再次点击时, 不做任何操作
        }
        selectIndex.value = index
        callback(e)
    }
    // 清空所有元素的选中状态
    const clearblockFocus = () => {
        data.value.blocks.forEach(block => { block.focus = false })
    }

    // 点击容器时, 清空所有元素的选中状态
    const containerMousedown = () => {
        clearblockFocus()
        selectIndex.value = -1
    }
    return {
        blockMouseDown,
        containerMousedown,
        focusData,
        lastSelectBlock
    }
}