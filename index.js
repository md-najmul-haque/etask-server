const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()

const port = process.env.PORT || 5000;

//middleware
const corsConfig = {
    origin: true,
    credentials: true,
}
app.use(cors(corsConfig));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldpeo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const taskCollection = client.db("etask").collection("task");

        // API to get pending task
        app.get('/task', async (req, res) => {
            const query = { completed: false }
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })

        // API to add pending task to the server
        app.post('/task', async (req, res) => {
            const query = req.body
            const result = await taskCollection.insertOne(query)
            res.send(result)
        })

        // API to get completed task
        app.get('/completedtask', async (req, res) => {
            const query = { completed: true }
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })

        app.put('/updatedTask/:id', async (req, res) => {
            const id = req.params.id;
            const updateTask = req.body;
            console.log(updateTask)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    taskName: updateTask.taskName,
                    taskDetail: updateTask.taskDetail,
                }
            }

            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        app.patch('/task/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    completed: true,
                }
            }
            const updateTask = await taskCollection.updateOne(filter, updateDoc);
            res.send(updateDoc);

        })


    }

    finally {

    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('etask is running')
})

app.listen(port, console.dir('Listening to the port', port))
