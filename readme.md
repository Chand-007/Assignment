This File contains the steps for coding application 

TableName - contact
Schema -{
    id  int
    phoneNumber String
    email String
    linkedId int [null or id]
    linkPrecedence String [Primary or Secondary]
    createdAt DateTime
    updatedAt DateTime
    deletedAt DateTime [null or value]
}