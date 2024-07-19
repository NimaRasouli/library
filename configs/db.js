
const { MongoClient } = require("mongodb")
const url = "mongodb://localhost:27017/"
const dbConnection = new MongoClient(url)
const dbName = "library"
require("dotenv").config()



const main = async () => {
    await dbConnection.connect()
    console.log("CONNECTED")
    const db = dbConnection.db(process.env.dbName)
    
    // const userCollection = db.collection("users")
    // const noCrimeUsers = await userCollection.find({crime :200}).toArray()
    // console.log(noCrimeUsers)
    
    const rentsCollections = db.collection("rents")
    const result = await rentsCollections.updateOne({BookID: 2} , {
        $set:{UserID : 300}
    }) 
    console.log(result)
    return "Done"
}
main()