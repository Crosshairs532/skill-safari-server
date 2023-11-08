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



        // app.get('/allJobs', async (req, res) => {
        //     console.log(req.query.jobtype, "inside server");
        //     let query = {};

        //     if (req.query.jobtype != 'all') {
        //         query["type"] = req.query.jobtype;
        //         try {
        //             const result = await JobCollections.find(query).toArray();
        //             res.send(result);
        //         } catch (error) {
        //             console.error(error);
        //             res.status(500).send('Error fetching job data');
        //         }
        //     }
        //     else if (req.query.jobtype == 'all') {
        //         const result = await JobCollections.find().toArray();
        //         res.send(result);
        //     }
        //     else {
        //         const result = await JobCollections.find().toArray();
        //         res.send(result);
        //     }
        //     //   console.log("here",query);

        // });

        app.get('/allJobs', async (req, res) => {
            let query = {};
            let id = {}

            if (req.query?.jobtype) {
                query = { type: req.query?.jobtype }
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



