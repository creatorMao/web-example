class NewsCenter{
  constructor(){
    this.event={}
  }
  subscribe(eventName,callBack){
    if(!this.event[eventName]){
      this.event[eventName]=[];
    }

    this.event[eventName].push(callBack);
  }

  publish(eventName,value){
      if(this.event[eventName]){
        this.event[eventName].forEach(element => {
          element(eventName,value);
        });
      }
  }
}

const newsCenter=new NewsCenter();

newsCenter.subscribe('杭州日报',function(eventName,news){
  console.log("小王:"+eventName+news);
});
newsCenter.subscribe('金华日报',function(eventName,news){
  console.log("小美:"+eventName+news);
});

newsCenter.publish('杭州日报','杭州红绿灯正式使用');