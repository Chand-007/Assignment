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

    const CommonPhoneNumber = savedResponse.filter((item)=>item.phoneNumber.includes(givenNumber) || item.email.includes(givenEmail))

    const primaryIds = []
    const secondaryIds = []
    const emails= []
    const phoneN = []

    for (const item of CommonPhoneNumber){
        if(item.linkPrecedence === "primary"){
            primaryIds.push(item.id)
            emails.push(item.email)
            phoneN.push(item.phoneNumber)
        }
        else if (item.linkPrecedence === "secondary"){
            secondaryIds.push(item.id)
            emails.push(item.email)
            phoneN.push(item.phoneNumber)
        }
    }

    const output = {
        "contact":{
            "primaryContactId":primaryIds[0],
            "emails":[... new Set(emails)],
            "phoneNumbers":[... new Set(phoneN)],
            "secondaryContactIds":secondaryIds
        }
    }
    res.status(200).json(output)
})





app.listen(5000,()=>{
    console.log("Server Listening on port 5000")
})