const express = require("express")
const app = express()
const {formatDate} = require('./DateTime')
app.use(express.json())
var count = 1
var savedResponse = []
var schema ={}

app.post('/identify',(req,res)=>{

    const givenNumber = req.body.phoneNumber
    const givenEmail = req.body.email
    var oldId
    var precedence 

    const findItemNumber = savedResponse.find((item)=>item.phoneNumber === givenNumber) 
    const findItemEmail = savedResponse.find((item)=>item.email === givenEmail)

    if(findItemNumber){
        oldId = findItemNumber.id
        precedence = "secondary"
    }
    else if(findItemEmail){
        oldId = findItemEmail.id
        precedence = "secondary"
    }
    else{
        oldId = null
        precedence = "primary"
    }

    if(findItemNumber && findItemEmail){
        if(findItemNumber.id !== findItemEmail.id){
            savedResponse = savedResponse.map((item)=>{
                if(item.phoneNumber === givenNumber){
                    return({
                        ...item,
                        "linkedId":findItemEmail.id,
                        "linkPrecedence":"secondary"
                    })
                }
                return item
            })
        }
        
        
    }
    else{
        schema = {
            "id":count++,
            "phoneNumber":req.body.phoneNumber,
            "email":req.body.email,
            "linkedId":oldId,
            "linkPrecedence": precedence,
            "createdAt" : formatDate(new Date()),
            "updatedAt" : formatDate(new Date()),
            "deletedAt" : null
        }
    
        savedResponse.push(schema)
    }

    
    console.log(schema)
    res.status(200).json(output)

    console.log("Saved Response at the end of request is::",savedResponse)
})



app.listen(5000,()=>{
    console.log("Server Listening on port 5000")
})