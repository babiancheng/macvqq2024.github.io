import { computed, defineComponent, inject, onMounted, ref } from "vue";
import './editor.scss'
export default defineComponent({
    props:{
        block:{type: Object}
    },
    setup(props){
        const blockStyles = computed(()=>({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: `${props.block.zIndex}`
        }));
        const config = inject('register'); // 获取全局注册的元素数据

        const blockRef = ref(null)
        onMounted(()=>{
            let {offsetWidth, offsetHeight} = blockRef.value;
            if (props.block.alignCenter) { 
                // 说明是拖拽松手的元素需要进行居中, 其他的元素渲染到页面中
                props.block.left = props.block.left - offsetWidth / 2;
                props.block.top = props.block.top - offsetHeight / 2;
                props.block.alignCenter = false; //让渲染后的结果才能去居中
            }
            // 设置组件的宽高
            props.block.width = offsetWidth;
            props.block.height = offsetHeight;
        })
        return ()=>{
            // 通过key获取组件
            const component = config.componentMap[props.block.key];
            // 获取组件的render方法
            const RenderComponent = component.render();
            return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
                {RenderComponent}
            </div>
        }
    }
})