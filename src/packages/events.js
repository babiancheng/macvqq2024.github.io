import mitt from 'mitt';

const eventBus = mitt();

export default eventBus; // 导出一个发布订阅的对象