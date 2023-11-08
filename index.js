const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
require('dotenv').config()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.send('server is running at this moment...')
})


console.log(process.env.DB_USER);

// DB_USER=Job
// Te09MhXqqfJvQSMm
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://jobuser:Te09MhXqqfJvQSMm@cluster0.wtx9jbs.mongodb.net/?retryWrites=true&w=majority";


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
        const JobCollections = client.db('JobSeekingDB').collection('Alljobs');
        const appliedJobCollection = client.db('JobSeekingDB').collection('Appliedjobs');


        app.get('/allJobs', async (req, res) => {
            let query = {};
            let id = {}

            if (req.query?.jobtype) {
                query = { Jtype: req.query?.jobtype }
                console.log(query);
            }


            const result = await JobCollections.find(query).toArray();
            res.send(result)

        })

        app.get('/alljobs/details', async (req, res) => {
            let id = {};
            if (req.query?.id) {
                id = { _id: new ObjectId(req.query?.id) }
                console.log(id, "id");
            }
            const resultByid = await JobCollections.findOne(id);
            res.send(resultByid);
        })


        app.post('/allJobs', async (req, res) => {
            const job = req.body;
            const result = await JobCollections.insertOne(job);
            res.send(result);
        })

        // applied job
        app.post('/appliedjobs', async (req, res) => {
            const job = req.body;
            const result = await appliedJobCollection.insertOne(job);
            res.send(result);

        })






        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})



