import { computed } from "vue";
export function Focus(data, callback) {
    // 计算出那些元素被选中, 那些元素没有被选中
    const focusData = computed(() => {
        let focus = [] // 被选中的元素
        let unfocus = [] // 没有被选中的元素
        data.value.blocks.forEach(block => (block.focus ? focus : unfocus).push(block))
        return { focus, unfocus }
    })
    const blockMouseDown = (e, block) => {
        // 在block上添加一个属性, 表示当前元素被选中
        e.preventDefault()
        e.stopPropagation()
        if (e.shiftKey) {
            block.focus = !block.focus; // 如果按住shift键, 则切换当前元素选中状态
        } else {
            if (!block.focus) {
                clearblockFocus()
                block.focus = true; // 设置当前元素被选中, 清空其他元素
            } else {
                block.focus = false
            }
        }
        callback(e)
    }
    // 清空所有元素的选中状态
    const clearblockFocus = () => { data.value.blocks.forEach(block => { block.focus = false }) }

    // 点击容器时, 清空所有元素的选中状态
    const containerMousedown = () => { clearblockFocus() }

    return {
        blockMouseDown,
        containerMousedown,
        focusData
    }
}