const path=require('path')

const pathResult=path.join(__dirname,'./','../')
console.log(pathResult);

const currentFileName=path.basename(path.join(__dirname,'./path.js'))
console.log(currentFileName)

const currentFileExtType=path.extname(path.join(__dirname,'./path.js'))
console.log(currentFileExtType)