// 1. 创建一个Vue类,该构造函数，接收一个配置参数对象
//   1.1基础设置 
//    - 将整个配置参数对象保存到$options属性上
//    - 将参数里el属性对应的dom节点，保存到$el属性上。
//    - 将参数里的data数据，保存到$data属性上
//    - 将$data对象里每一个一级属性，通过代理的形式，注入到当前对象一级属性上。
//      （这一步只是为了方便后期取数，例如this.$data.msg 可以写成 this.msg，少些了一层路径$data）
//   1.2 将$data属性里，所有层级的属性，通过Object.defineProperty，重写get/set方法，实现数据拦截
//       (这里才是核心，因为会循环所有层级的属性)

// 2. 创建一个解析类，用于解析vue中的指令和插值表达式
//      - 根据传过来的元素节点，遍历里面的子节点，并判断节点类型
//        - 文本节点: 解析插值表达式
//        - 元素节点：解析各种指令（这里只实现v-text v-model）

// 3. 实现双向绑定，这里使用了观察者模式。
//   3.1 创建一个主题类，或者可以理解为依赖类Dep，用于收集依赖。
//   3.2 创建一个观察者类，或者理解为Watcher类。
// 5. 给data里的每一个属性，都生成一个对应的Dep实例。
//    - 在第一次解析模板时，会使用到get函数，因此在get时，收集该属性的依赖。(相当于观察者，订阅了主题)
//    - 在后续该属性数据发生变化时，也就是触发set函数时，通知该属性的所有观察者更新视图（相当于主题通知观察者更新）

class Vue{
  constructor(options){
      //1.1
      this.$options=options
      this.$el=document.querySelector(options.el)
      this.$data=options.data;
      this.ProxyData(this.$data);

      //1.2
      InterceptData(this.$data);

      //2
      new Compile(this);
  }

  ProxyData(data){
    Object.keys(data).forEach((key)=>{
      let value=data[key]  
      Object.defineProperty(this,key,{
        get(){
          console.log(`get1 key: ${key} value:${value}`);
          return value
        },
        set(newValue){
          if(newValue===data[key]){
            return
          }
          value=newValue  
        }
      })
  
    })
  }
}

class Compile{
  constructor(vm){
    this.rootElementNode=vm.$el;
    this.vm=vm;
    this.compile(this.rootElementNode);
  }
  compile(el){
    if(el.childNodes){
      el.childNodes.forEach((node)=>{
        switch(node.nodeType){
          case 1:
            this.compileElementNode(node);
            break;
          case 3:
            this.compileTextNode(node)
            break;
        }
  
        this.compile(node);
      })
    }   
  }
  compileTextNode(node){
    let textContent=node.textContent.trim()
    if(textContent){
      const pattern=/\{\{\s*(\S+)\s*\}\}/
      const patternRes=pattern.exec(textContent);
      if(patternRes){
        const exp=patternRes[1];

        let watcher=new Watcher(this.vm,exp,(newValue)=>{
          node.textContent=textContent.replace(pattern,newValue)
        })
        

        node.textContent=textContent.replace(pattern,getPropertyValue(this.vm,exp))
      }
    }
  } 
  compileElementNode(node){
    Array.from(node.attributes).forEach((attribute)=>{
      const attributeName=attribute.name
      const exp=attribute.value
      if(attributeName.startsWith('v-')){
        const directiveName=attributeName.substring(2)

        let watcher=new Watcher(this.vm,exp,(newValue)=>{
          this[directiveName+"Deal"](this.vm,node,undefined,newValue);
        })

        this[directiveName+"Deal"](this.vm,node,exp);
      }
    })
  }
  textDeal(vm,node,exp,expValue){
    node.textContent=expValue?expValue:getPropertyValue(vm,exp)
  }
  modelDeal(vm,node,exp,expValue){
    const value= expValue?expValue:getPropertyValue(vm,exp)    
    node.value=value
    node.addEventListener('input',()=>{
      if(exp){
        setPropertyValue(vm,exp,node.value);
      }
    })
  }
}

class Dep{
  constructor(){
    this.watchers=[];
  }
  addWatcher(watcher){
    this.watchers.push(watcher);
  }
  notify(){
    this.watchers.forEach((watcher)=>{
      if(watcher.update){
        watcher.update();
      }
    })
  }
}

class Watcher{
  constructor(vm,exp,callBack){
    this.vm=vm;
    this.exp=exp;
    this.callBack=callBack;

    Dep.currentWatcher=this;
    
    //主动触发一次get操作，用于dep类收集依赖。
    getPropertyValue(this.vm.$data,exp);

    Dep.currentWatcher=null;
  }
  update(){
    let newValue=getPropertyValue(this.vm.$data,this.exp);
    this.callBack(newValue);
  }
}

function setPropertyValue(obj, propertyPath,value) {
  let root=propertyPath.split('.')
  let result=obj;
  root.forEach((item,index)=>{
    if(index!=root.length-1){
      result=result[item]
    }
  })
  result[root[root.length-1]]=value
}


function getPropertyValue(obj, propertyPath) {
  return propertyPath.split('.').reduce((total, current) => {
    const patten = /(\S*)\[(\S*)\]/
    const pattenRes = patten.exec(current)
    if (pattenRes) {
      return total[pattenRes[1]][pattenRes[2]]
    } else {
      return total[current]
    }
  }, obj)
}

function InterceptData(data){  
  if(!data|| typeof data!=='object'){
    return
  }

  Object.keys(data).forEach((key)=>{
    let value=data[key]
    let dep=new Dep();
    InterceptData(data[key]);

    Object.defineProperty(data,key,{
      get(){
        console.log(`get2 key: ${key} value:${value}`);
        if(Dep.currentWatcher){
          dep.addWatcher(Dep.currentWatcher)
        }
        return value
      },
      set(newValue){
        if(newValue===data[key]){
          return
        }
        value=newValue
        dep.notify();
        InterceptData(data[key]);
      }
    })

  })
}
