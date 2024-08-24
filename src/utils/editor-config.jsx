// 列表区显示所有的无聊
// key对应组件的映射关系
let registerConfig = createEditorConfig()

function createEditorConfig(){
    const componentList = [];
    const componentMap = {};
    return {
        componentList,
        componentMap,
        register:(component)=>{
            componentList.push(component)
            componentMap[component.key] = component
        }
    }
}

// 分开注册是因为每一个组件的配置项不一样, 所以需要分开注册
registerConfig.register({
    label: "文本",
    preview:()=>"预览文本",
    render:()=>"渲染文本",
    key: 'text'
})

registerConfig.register({
    label: "按钮",
    preview:()=><el-button>预览按钮</el-button>,
    render:()=><el-button>渲染按钮</el-button>,
    key: "button"
})

registerConfig.register({
    label: "输入框",
    preview:()=><el-input placeholder="预览输入框" />,
    render:()=><el-input placeholder="渲染输入框" />,
    key: "input"
});

export {registerConfig}