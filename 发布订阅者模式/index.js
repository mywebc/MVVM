// 定义
let boss = {
    // 收集列表
    list: {},
    // 订阅
    listen(id, info) {
        // 看是否收集过信息
        if(!this.list[id]) {
            this.list[id] = []
        }
        this.list[id].push(info)
        console.log("信息订阅成功！")

    },
    publish(id) {
        // 取出订阅者信息
        let infos = this.list[id] 
        infos.map((item) => {
            console.log(id+':')
            item()
        })
    }

}
boss.listen('张三', () => {
    console.log("电话是123")
})
boss.listen('张三', () => {
    console.log("住址是上海")
})
boss.publish("张三")
