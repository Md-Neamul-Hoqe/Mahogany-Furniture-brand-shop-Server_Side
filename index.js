const express = require('express');
const cors = require('cors');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

/* middleware */
app.use(cors());
app.use(express.json());

// const uri = "https://mahogany-furniture-server-5z8ga4sbo-muhammad-neamul-hoqes-projects.vercel.app";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.481il7d.mongodb.net/?retryWrites=true&w=majority`;
const uri = 'mongodb://127.0.0.1:27017';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const productCollection = client.db('Mahogany').collection("furniture");
        const userCollection = client.db('Mahogany').collection('users');

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        

        /**
         *  if get 
         * [
         * PATCH http://localhost:5000/user 404 (Not Found) Uncaught (in promise), 
         * SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
         * ] Error then check :=> 
         * ======================
         * -> the URI in fetch is correct & same as server side pathname
         * -> the method name in server side app.[method name] & in client side on fetch 2nd parameter method
        */
        /**
         *  if get 
         * [
         * Uncaught (in promise) TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
         * ] Error then check :=> 
         * ======================
         * -> the method name in server side app.[method name] & in client side on fetch 2nd parameter method
        */
        /**
         * if DB not updated / modified 
         * without any Error then check :=> 
         * ===============================
         *  -> the property name or value in client site fetch 2nd parameter like 'content-type', headers etc 
         * */

        app.patch('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };

            const updateDoc = {
                $set: {
                    lastSignInAt: user.lastSignInAt
                }
            }

            const result = await userCollection.updateOne(query, updateDoc)
            res.send(result);
        })

        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(id);
            const result = await userCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })


    } catch (error) {
        console.error(error);
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



/* check the app is running  */
app.get('/', (req, res) => {
    res.send('App is running');
})

/* check the server is running */
app.listen(port, () => {
    console.log(`App's server is running on PORT: ${port}`);
})

