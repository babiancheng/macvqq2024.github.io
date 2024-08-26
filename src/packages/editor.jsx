import { computed, defineComponent, inject, onMounted, ref } from "vue";
import './editor.scss'
import editorBlock from "./editor-block"; // 引入组件
import deepcopy from "deepcopy";
import { MenuDragger } from "./MenuDragger";
import { Focus } from "./Focus";
import BlockDragger from "./BlockDragger";
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
        const containerRef = ref(null) // 容器ref

        // 实现拖拽功能, 定义的拖拽开始事件和拖拽结束事件
        const { dragStart, dragEnd } = MenuDragger(containerRef, data);

        // 获取焦点事件, 选中以后就可以进行拖拽多个元素
        const { blockMouseDown, containerMousedown, focusData, lastSelectBlock } = Focus(data, (e) => {
            // 获取焦点后进行拖拽
            mousedown(e)
        });

        // 对获取焦点的元素进行拖拽
        const { mousedown, markline } = BlockDragger(focusData, lastSelectBlock)

        return () =>
            <div class='editor'>
                <div class='editor_left'>
                    {/* 根据注册列表, 渲染对应内容, 可以实现拖拽 */}
                    
                    {config.componentList.map(component => (
                        <el-tooltip
                            class="box-item"
                            effect="dark"
                            content={component.label}
                            placement="right"
                        >
                            <div class='editor_left_item'
                                draggable={true} // 可移动
                                onDragstart={(e) => dragStart(e, component)} // 拖拽开始
                                onDragEnd={dragEnd} // 拖拽离开
                            >
                                <div>{component.preview()}</div>
                            </div>
                        </el-tooltip>
                    ))}
                </div>
                <div class='editor_top'>顶部菜单栏</div>

                <div class='editor_container'>
                    <div class='editor_container_canvas'>
                        <div
                            class='editor_container_canvas_content'
                            style={containerStyle.value}
                            ref={containerRef}
                            onMousedown={containerMousedown}
                        >
                            {
                                (data.value.blocks.map((block, index) => (
                                    <editorBlock
                                        block={block}
                                        class={block.focus ? "editor_block_focus" : ""}
                                        onMousedown={(e) => blockMouseDown(e, block, index)}
                                    ></editorBlock>
                                )))
                            }
                            {markline.x !== null && <div class="line_x" style={{left: markline.x + "px"}}></div>}
                            {markline.y !== null && <div class="line_y" style={{top: markline.y + "px"}}></div>}
                        </div>
                        
                    </div>
                </div>

                <div class='editor_right'>右侧物料区</div>
            </div>
    }
})