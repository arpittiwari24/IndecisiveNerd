const express = require("express") 
require('dotenv').config()
const path = require("path")
const { default: mongoose } = require("mongoose")
const cookieParser = require('cookie-parser');
const app = express()

// dotenv.config({
//     path: "./env"
// })

mongoose.connect(process.env.MONGO_URI,{
    dbName: "Test"
}).then(() => {
    console.log("connected to the database");
}).catch((error) => {
    console.log(error);
})

const problems = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    yes : {
        type: Number,
        default: 0
    },
    no: {
        type: Number,
        default : 0
    }
})

const problemModel = mongoose.model("Problems",problems)

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'views')))

var cons = require('consolidate');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Define a route to render the EJS template with data
app.get("/",  (req, res) => {
    res.render('index');
});

app.get("/all", async (req,res) => {
    const data = await problemModel.find().sort({ _id: -1}).exec();
    res.json(data)
})
app.post("/new", async (req,res) => {
    try {
        const {description} = req.body
        const ip = req.ip
        console.log(ip);
        await problemModel.create({description})
        res.status(201).json("Created successfully")
    } catch (error) {
        console.log(error);
        res.status(500).json("Comment Interested !!")
    }
})

app.post("/yes",async (req,res) => {
    try {
        const {id} = req.body
        const problem = await problemModel.findById(id)
        if(!problem) {
            return res.status(404).json("You Nerd . This problem doesn't exist .")
        } else {
            const alreadyVoted = req.cookies[`yes_${id}`] || req.cookies[`no_${id}`];
            if (alreadyVoted) {
                return res.status(403).send('You have already voted.');
            } else {
                problem.yes += 1
                await problem.save()
                 res.cookie(`yes_${id}`, true, { maxAge: 24 * 60 * 60 * 1000 });
                 res.status(200).json(problem)
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json("Comment Interested !!")
    }
})

app.post("/no",async (req,res) => {
    try {
        const {id} = req.body
        const problem = await problemModel.findById(id)
        if(!problem) {
            return res.status(404).json("You Nerd . This problem doesn't exist .")
        } else {
            const alreadyVoted = req.cookies[`yes_${id}`] || req.cookies[`no_${id}`];
            if (alreadyVoted) {
                return res.status(403).send('You have already voted.');
            } else {
                problem.no += 1
                await problem.save()
                 res.cookie(`no_${id}`, true, { maxAge: 24 * 60 * 60 * 1000 });
                 res.status(200).json(problem)
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json("Comment Interested !!")
    }
})

app.listen(9999,() => {
    console.log(`Server started on port 9999`);
})