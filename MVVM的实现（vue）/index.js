/**
*
    思路整理,要实现mvvm的双向绑定，就必须要实现以下几点：
1、实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
2、实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
3、实现一个Watcher，能够订阅并收到每个属性变动的通知，其实也就是作为连接Observer和Compile的桥梁,执行指令绑定的相应回调函数，从而更新视图
4、最后对三者进行整合

时间原因,我们的实现肯定有很多不足的地方,但是这个MVVM的实现虽然简单,但是骨架是健全的,麻雀虽小五脏俱全,其实这也就是vue实现双向绑定的核心原理,大家要是能够在此基础上进行拓展延伸,当然更好
*
*
*/


function Vue( options = {} ) {
    this.$options = options;
    // this._data;
    var data = this._data = this.$options.data;
    // 监听 data 的变化
    observe(data);
    // 实现代理  this.a 代理到 this._data.a
    for(let name in data) {
        Object.defineProperty( this, name, {
            enumerable: true,
            get() {
                // this.a 获取的时候返回 this._data.a
                return this._data[name];
            },
            set(newVal) {
                // 设置 this.a 的时候相当于设置  this._data.a
                this._data[name] = newVal;
            }
        })
    }
    // 实现模板编译
    new Compile(this.$options.el, this)
}

// el:当前Vue实例挂载的元素， vm：当前Vue实例上data，已代理到 this._data
function Compile(el, vm) {
    // $el  表示替换的范围
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    // 将 $el 中的内容移到内存中去
    while( child = vm.$el.firstChild ) {
        fragment.appendChild(child);
    }
    replace(fragment);
    // 替换{{}}中的内容
    function replace(fragment) {
        Array.from(fragment.childNodes).forEach( function (node) {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            // 当前节点是文本节点并且通过{{}}的正则匹配
            if(node.nodeType === 3 && reg.test(text)) {
                // RegExp $1-$9 表示 最后使用的9个正则
                let thisexp = RegExp.$1.trim();
                let val = vm[thisexp];
                // 赋值
                new Watcher( vm, RegExp.$1, function(newVal) {
                    // 将{{ a }} 替换为真实的数值
                    node.textContent = text.replace(reg, newVal);
                })
                node.textContent = text.replace(reg, val);
            }
            vm.$el.appendChild(fragment)
            // 如果当前节点还有子节点，进行递归操作
            if(node.childNodes) {
                replace(node);
            }
        })
    }
}

function Observe(data) {
    // 开启订阅发布模式
    let dep = new Dep();
    for(let key in data) {
        let val = data[key];
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                // 在获取值的时候添加进订阅列表当前key
                Dep.target && dep.addSub(Dep.target);
                return val;
            },
            set(newVal) {
                if(newVal === val) {
                    return;
                }
                // 设置值的时候触发
                val = newVal;
                // 实现赋值后的对象监测功能
                // 让所有的watch的update方法都执行
                dep.notify();
            }
        })
    }
}

// 观察数据，给data中的数据object.defineProperty
function observe(data) {
    if(typeof data !== 'object') {
        return;
    }
    return new Observe(data);
}
// 发布订阅模式
function Dep() {
    this.subs = [];
}
//发布
Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
}

//订阅
Dep.prototype.notify = function () {
    this.subs.forEach( sub => sub.update());
}
// watcher ,vm就是当前vue实例,exp就是data中的属性表达式,fn就是传入的回调函数,赋值的时候,值一旦改变就要执行的方法
function Watcher (vm, exp, fn) {
    this.vm = vm;
    this.exp = exp;
    this.fn = fn
    // 将watch添加到订阅中
    Dep.target = this;
    let val = vm[exp]
}
Watcher.prototype.update = function() {
    let val = this.vm[this.exp];
    // 需要传入newVal
    this.fn(val);
}
