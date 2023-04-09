const fs=require('fs')

fs.readFile(__dirname+'./../test.txt','utf-8',(err,data)=>{
    console.log(data);
    console.log(err);
})

// fs.writeFile('../testWrite.txt','csss',(err)=>{
//     console.log(err);
// })
