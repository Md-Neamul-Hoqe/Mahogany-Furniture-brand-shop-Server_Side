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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@assignment-10.v0k6exy.mongodb.net/?retryWrites=true&w=majority`;

// const uri = 'mongodb://127.0.0.1:27017';
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
        const brandCollection = client.db('Mahogany').collection('brands');

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        /* Inset one user to the database */
        app.post('/users', async (req, res) => {
            const user = req.body;

            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        /* Inset one product to the database */
        app.post('/products', async (req, res) => {
            const newProduct = req.body;

            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        /* Get all products from the database */
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find();

            const result = await cursor.toArray();

            res.send(result);
        })


        /* Get The brands from the database */
        app.get('/brands', async (req, res) => {
            const result = await brandCollection.find().toArray();
            res.send(result);
        })

        /* Get all products of a brand from the database */
        app.get('/shop/:brand', async (req, res) => {
            const brand = req.params.brand;

            const query = { brand: brand };

            const result = await productCollection.find(query).toArray();

            res.send(result);
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const product = {
                $set: {
                    name: updatedProduct.name,
                    chef: updatedProduct.chef,
                    supplier: updatedProduct.supplier,
                    taste: updatedProduct.taste,
                    category: updatedProduct.category,
                    details: updatedProduct.details,
                    photo: updatedProduct.photo,
                }
            }

            const result = await productCollection.updateOne(query, product, options);

            res.send(result);
        })

        /* to update a product first need to get the product & then edit & then use app.put to update in server */
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);

            res.send(result);
        })


        /* must use delete to execute delete */
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await productCollection.deleteOne(query);

            res.send(result);
        })


        /* User APIs */
        app.get('/users', async (req, res) => {
            /* find users from the database table `userCollection`& form an array of users object */
            const result = await userCollection.find().toArray();
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

        app.patch('/users', async (req, res) => {
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

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await userCollection.deleteOne(query);

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

// DB_USER=CoffeeMaster
// # DB_PASS=JOEyGX1lVEw1vaZz



















































// # const { MongoClient, ServerApiVersion } = require('mongodb');
// # const uri = "mongodb+srv://mdneamulhoqe:<password>@assignment-10.v0k6exy.mongodb.net/?retryWrites=true&w=majority";

// # // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// # const client = new MongoClient(uri, {
// #   serverApi: {
// #     version: ServerApiVersion.v1,
// #     strict: true,
// #     deprecationErrors: true,
// #   }
// # });

// # async function run() {
// #   try {
// #     // Connect the client to the server	(optional starting in v4.7)
// #     await client.connect();
// #     // Send a ping to confirm a successful connection
// #     await client.db("admin").command({ ping: 1 });
// #     console.log("Pinged your deployment. You successfully connected to MongoDB!");
// #   } finally {
// #     // Ensures that the client will close when you finish/error
// #     await client.close();
// #   }
// # }
// # run().catch(console.dir);
