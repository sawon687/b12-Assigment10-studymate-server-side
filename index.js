const express=require('express');
const app=express();
const core=require('cors')
const port=process.env.PORT || 3000

app.use(express.json())
app.use(core())

app.get('/',(req,res)=>{
    res.send('server start studymate')
})

app.listen(port,()=>{
    console.log('server start here studymate ',port)
})