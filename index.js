const express = require('express');
const cors = require('cors');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

/* middleware */
// const corsConfig = {
//     origin: '',
//     credentials: true,
//     methods: [ 'GET', 'POST', 'PATCH', 'PUT', 'DELETE' ]
// }
// app.use(cors(corsConfig))
// app.options("", cors(corsConfig))

app.use(cors())

app.use(express.json());

// const uri = "https://mahogany-furniture-server-5z8ga4sbo-muhammad-neamul-hoqes-projects.vercel.app";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.481il7d.mongodb.net/?retryWrites=true&w=majority`;
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@assignment-10.v0k6exy.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const productCollection = client.db('Mahogany').collection("furniture");
        const userCollection = client.db('Mahogany').collection('users');
        const brandCollection = client.db('Mahogany').collection('brands');

        /* save cart after sign in, without sign in save in local storage */
        const cartCollection = client.db('Mahogany').collection('cart');

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

        /* User APIs */
        app.get('/users', async (req, res) => {
            /* find users from the database table `userCollection`& form an array of users object */
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        /* Get all products from the database */
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find();

            const result = await cursor.toArray();

            res.send(result);
        })

        /* to update a product first need to get the product & then edit & then use app.put/patch to update in server */
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);

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

        app.patch('/products', async (req, res) => {
            const updatedProperties = req.body;
            const id = updatedProperties.id;

            const query = { _id: new ObjectId(id) };
            const options = { upsert: true }

            console.log(id, updatedProperties, query);

            const product = {
                $set: {
                    title: updatedProperties.title,
                    subtitle: updatedProperties.subtitle,
                    brand: updatedProperties.brand,
                    type: updatedProperties.type,
                    tags: updatedProperties.tags,
                    details: updatedProperties.details,
                    photo: updatedProperties.photo,
                }
            }

            const result = await productCollection.updateOne(query, product, options);

            res.send(result);
        })

        /* Update an User */
        app.patch('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };

            const updateUser = {
                $set: {
                    lastSignInAt: user.lastSignInAt
                }
            }

            const result = await userCollection.updateOne(query, updateUser)
            res.send(result);
        })

        /* Delete a product */
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await productCollection.deleteOne(query);

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

        /* Cart APIs */
        app.get('/cart', async (req, res) => {
            /* find users from the database table `userCollection`& form an array of users object */
            const result = await cartCollection.find().toArray();
            res.send(result);
        })

        app.get('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            /* find users from the database table `userCollection`& form an array of users object */
            const result = await cartCollection.findOne(query, { upsert: true });
            res.send(result);
        })

        /* Inset one product to the database */
        app.post('/cart', async (req, res) => {
            const newProduct = req.body;

            console.log(newProduct);

            const result = await cartCollection.insertOne(newProduct);
            res.send(result);
        })

        app.patch(`/cart/:id`, async (req, res) => {
            const newProduct = req.body;
            const id = req.params.id;

            const query = { _id: new ObjectId(id) };

            const updateProduct = {
                $set: {
                    _id: new ObjectId(id),
                    purchase: newProduct.purchase,
                    title: newProduct.title,
                    subtitle: newProduct.subtitle,
                    brand: newProduct.brand,
                    type: newProduct.type,
                    tags: newProduct.tags,
                    price: newProduct.price,
                    ratings: newProduct.ratings,
                    description: newProduct.description,
                    status: newProduct.status,
                }
            }

            const result = await cartCollection.updateOne(query, updateProduct, { upsert: true })
            res.send(result);
        })


        /* Delete a product from cart */
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await cartCollection.deleteOne(query);

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
