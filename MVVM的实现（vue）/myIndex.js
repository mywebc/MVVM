// 首先是一个构造函数
function Vue(options) {
    // 传入一个对象
    // 数据代理 this.options.data的访问形式 代理到 this.data的访问形式
    this.$options = options
    var data = this._data = this.$options.data
    // 监听data的变化
    observe(data)
    // 为了这样使用this.a this.b 
    // 代理this.$options.data到this 使用Object.defineProperty
    for(var name in data) {
        Object.defineProperty(this, name, {
            configurable: false,// 是否可配置
            enumerable: true,// 是否可枚举
            get() {
                // 访问this.a
                return this._data[name]
            },
            set(newVal) {
                // 设置this.a = 11
                this._data[name] = newVal
            }
        })
    }
    //模板编译
    new Compile(this.$options.el, this);
}
// 实现模板编译
function Compile(el, vm) {
    // 筛选出vm挂载的范围
    vm.$el = document.querySelector(el)
    // 创建文档片段 (内存)
    let fragment = document.createDocumentFragment()
    // 将$el中的内容移到内存中去
    // 把第一个节点赋值给child，直到没有
    while( child = vm.$el.firstChild ) {
        fragment.appendChild(child)   
    }
    // 替换{{}}中的内容
    replace(fragment)
    function replace() {    
        Array.from(fragment.childNodes).map((node) => {
            // 拿到节点内容
            let text = node.textContent
            let reg = /\{\{(.*)\}\}/
            // 当前节点是文本节点并且符合正则匹配
            if(node.nodeType === 3 && reg.test(text)) {
                
                var thisexp = RegExp.$1.trim()
            }

        })
    }

}