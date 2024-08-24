import { computed, defineComponent, inject, onMounted, ref } from "vue";
import './editor.scss'
import editorBlock from "./editor-block";
import deepcopy from "deepcopy";
import { MenuDragger } from "./MenuDragger";
export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const data = computed({
            get() {
                return props.modelValue
            },
            set(newValue) {
                ctx.emit("update:modelValue", deepcopy(newValue))
            }
        })
        const containerStyle = computed(() => ({
            width: data.value.container.width + "%",
            height: data.value.container.height + '%'
        }))
        const config = inject('register'); // 获取全局注册的元素数据
        console.log("config", config);

        const containerRef = ref(null) // 容器ref

        // 拖拽事件
        const { dragStart, dragEnd } = MenuDragger(containerRef, data);

        // 获取焦点事件
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
        }
        const clearblockFocus = () => {
            data.value.blocks.forEach(block => {
                block.focus = false
            })
        }


        // 实现拖拽多个元素
        return () =>
            <div class='editor'>
                <div class='editor_left'>
                    {/* 根据注册列表, 渲染对应内容, 可以实现拖拽 */}
                    {config.componentList.map(component => (
                        <div class='editor_left_item'
                            draggable={true} // 可移动
                            onDragstart={(e) => dragStart(e, component)} // 拖拽开始
                            onDragEnd={dragEnd} // 拖拽离开
                        >
                            <span>{component.label}</span><br />
                            <div>{component.preview()}</div>
                        </div>
                    ))}
                </div>
                <div class='editor_top'>顶部菜单栏</div>

                <div class='editor_container'>
                    <div class='editor_container_canvas'>
                        <div class='editor_container_canvas_content' style={containerStyle.value} ref={containerRef}>
                            {
                                (data.value.blocks.map(block => (
                                    <editorBlock
                                        block={block}
                                        class={block.focus ? "editor_block_focus" : ""}
                                        onMousedown={(e) => blockMouseDown(e, block)}
                                    ></editorBlock>
                                )))
                            }
                        </div>
                    </div>
                </div>

                <div class='editor_right'>右侧物料区</div>
            </div>
    }
})