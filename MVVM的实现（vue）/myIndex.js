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
    function replace(fragment) {    
        Array.from(fragment.childNodes).map( function(node) {
            // 拿到节点内容
            let text = node.textContent
            let reg = /\{\{(.*)\}\}/
            // 当前节点是文本节点并且符合正则匹配
            if(node.nodeType === 3 && reg.test(text)) {
                // 以括号为例，匹配正则的第一个匹配
                var thisexp = RegExp.$1.trim()
                // 上面已经进行数据代理了，相当于this.a
                // 拿到这个值
                let val = vm[thisexp]
                // 我们目的就是要拿到这个值，然后监听
                new Watcher( vm, RegExp.$1, function(newVal) {
                    // 监听的目的还是要赋值
                    node.textContent = text.replace(reg, newVal)
                } )
                // 直接赋值
                node.textContent = text.replace(reg, val)
            }
            vm.$el.appendChild(fragment)
            if(node.childNodes) {
                // 如果当前节点还有子节点，递归
                replace(node)
            }
        })
    }
}

function observe(data) {
    if(typeof data !== 'object') {
        return
    }
    return new Observe(data)
}

function Observe(data) {
    // 开启发布订阅模式
    let dep = new Dep()
    for(let key in data) {
        let val = data[key]
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                return val
            },
            set(newVal) {
                // 如果数据不变
                if(val === newVal) {
                    return
                }
                // 否则赋值
                val = newVal
                // 通知更新方法
                dep.notify()
            }
        })
    }
}

// 发布订阅模式
function Dep() {
    this.subs = []
}
// 订阅（收集信息）
Dep.prototype.addSub = function(sub) {
    this.subs.push(sub)
}
// 发布
Dep.prototype.notify = function() {
    this.subs.map((sub) => {
        sub.update()
    })
}

function Watcher (vm, exp, fn) {
    this.vm = vm
    this.exp = exp
    this.fn = fn
    Dep.target = this
}

Watcher.prototype.update = function() {
    let val = this.vm[this.exp]
    this.fn(val)
}