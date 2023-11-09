const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config()
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.get('/', async (req, res) => {
    res.send('server is running at this moment...')
})


console.log(process.env.DB_USER);

// DB_USER=Job
// Te09MhXqqfJvQSMm
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wtx9jbs.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const varify = async (req, res, next) => {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
        return res.status(401).send({ message: 'unauthorized user' })

    }
    else {
        jwt.verify(token, process.env.TOKEN, (err, decode) => {
            if (err) {
                return res.status(401).send({ message: 'unauthorized user' })
            }
            req.user = decode;
            next()

        })
    }

}

async function run() {
    try {

        await client.connect();
        const JobCollections = client.db('JobSeekingDB').collection('Alljobs');
        const appliedJobCollection = client.db('JobSeekingDB').collection('Appliedjobs');
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user, "user");
            const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '2h' })
            res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'none' }).send({ token: token })
        })
        app.post('/logout', async (req, res) => {
            const user = req.body;
            res.clearCookie("token", { maxAge: 0 }).send({ success: true })
        }
        )


        app.get('/allJobs', async (req, res) => {
            console.log(req.query.email);


            let query = {};

            if (req.query.jobtype) {
                query.Jtype = req.query.jobtype;
            }
            if (req.query.email) {
                query.Pemail = req.query.email;
            }
            console.log(query);

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

        app.put('/allJobs/:id', async (req, res) => {
            const { image,
                Pname,
                Jtitle,
                salary,
                Jtype,
                applicants,
                description,
                postdate1,
                deadline1
            } = req.body;
            console.log(req.body);
            const options = { upsert: true };
            const id = { _id: new ObjectId(req.params.id) }
            const updateDoc = {
                $set: {
                    image: image,
                    Pname: Pname,
                    Jtitle: Jtitle,
                    salary: salary,
                    Jtype: Jtype,
                    applicants: applicants,
                    description: description,
                    postdate1: postdate1,
                    deadline1: deadline1

                },
            };

            const result = await JobCollections.updateOne(id, updateDoc, options)
            res.send(result);


        })

        app.delete('/allJobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await JobCollections.deleteOne(query)
            res.send(result)
        })

        // applied job
        app.get('/appliedjobs/:email', varify, async (req, res) => {
            console.log(req.params.email);
            console.log(req.user.email);
            if (req.user.email != req.params.email) {
                return res.status(401).send({ message: 'unauthorized user' })
            }
            const email1 = req.params.email;
            const query = { email: email1 }
            const result = await appliedJobCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/appliedjobs', async (req, res) => {
            const job = req.body;
            const newJob = { email: job.email, name: job.name, resume: job.resume, Jtype: job.Jtype }
            console.log(job._id);
            const id = { _id: new ObjectId(job._id) }
            const update = {
                $inc: {
                    applicants: 1
                }
            }
            const updatedOne = await JobCollections.updateOne(id, update)
            const result = await appliedJobCollection.insertOne(newJob);
            res.send({ success: true });

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



