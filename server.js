const express = require("express")
const app = express()
const {formatDate} = require('./DateTime')
app.use(express.json())

app.post('/identify',(req,res)=>{
    
   
})

app.listen(5000,()=>{
    console.log("Server Listening on port 5000")
})