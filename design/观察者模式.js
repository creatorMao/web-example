class Subject{
  constructor(){
    this.newsList=[];
    this.observerList=[];
  }

  subscribe(observer){
    this.observerList.push(observer)
  }

  addNews(news){
    this.newsList.push(news);
    this.observerList.forEach((item)=>{
      item.update(news)
    })
  }
}

class Person{
  constructor(name){
    this.name=name
  }

  update(news){
    console.log(`${this.name}:你收到了一条新闻:${news}`);  
  }
}

//消息中心
const newsCenter=new Subject();

const observer1=new Person('小王');
const observer2=new Person('小李');

newsCenter.subscribe(observer1)
newsCenter.subscribe(observer2)

newsCenter.addNews('红绿灯总设计师，抖音直播10分钟，被网友骂哭！！');