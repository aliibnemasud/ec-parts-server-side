const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const sendEmail = require("./shared/sendEmail");
const verifyJwt = require("./shared/verifyJwt");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
	res.send("Manufacturer Website Server is Running...");
});

//  Mongodb Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecparts.fhkxc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
async function run() {
	try {
		await client.connect();
		const toolsCollection = client.db("ecparts").collection("tools");
		const ordersCollection = client.db("ecparts").collection("order");
		const usersCollection = client.db("ecparts").collection("users");
		const reviewsCollection = client.db("ecparts").collection("reviews");
		const blogCollection = client.db("ecparts").collection("blogs");
		const paymentsCollection = client.db("ecparts").collection("payments");
		// Depictions server code
		const secretKeyCollection = client.db("ecparts").collection("secrectkey");
		const detectionsCollection = client.db("ecparts").collection("detections");

		// Load all tools
		app.get("/tools", async (req, res) => {
			const query = {};
			const cursor = toolsCollection.find(query);
			const tools = await cursor.toArray();
			res.send(tools);
		});
		// add new tools/product
		app.post("/tools", async (req, res) => {
			const tool = req.body;
			const result = await toolsCollection.insertOne(tool);
			res.send(result);
		});
		// Load dynamic route for tools
		app.get("/tools/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await toolsCollection.findOne(query);
			res.send(result);
		});
		// Delete Tools
		app.delete("/tool/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await toolsCollection.deleteOne(query);
			res.send(result);
		});
		// Get all order
		app.get("/allorders", async (req, res) => {
			const query = {};
			const cursor = ordersCollection.find(query);
			const allOrders = await cursor.toArray();
			res.send(allOrders);
		});
		// Order api - working
		app.post("/orders", async (req, res) => {
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			sendEmail(order);
			res.send(result);
		});
		// Load Orders - Individual - jwt
		app.get("/orders", verifyJwt, async (req, res) => {
			const decodedEmail = req.decoded.email;
			const email = req.query.email;
			if (email === decodedEmail) {
				const query = { email: email };
				const cursor = ordersCollection.find(query);
				const orders = await cursor.toArray();
				res.send(orders);
			} else {
				res.status(403).send({ message: "forbidden access" });
			}
		});
		// Delete Order Data
		app.delete("/orders/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await ordersCollection.deleteOne(query);
			res.send(result);
		});
		// Load order by id
		app.get("/order/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await ordersCollection.findOne(query);
			res.send(result);
		});
		// Register user to the database
		app.put("/users/:email", async (req, res) => {
			const email = req.params.email;
			const user = req.body;
			const filter = { email: email };
			const option = { upsert: true };
			const updateUser = {
				$set: user,
			};
			const result = await usersCollection.updateOne(
				filter,
				updateUser,
				option,
			);
			res.send(result);
		});
		// Load Users
		app.get("/users", async (req, res) => {
			const query = {};
			const cursor = usersCollection.find(query);
			const users = await cursor.toArray();
			res.send(users);
		});
		// Load single user by id
		app.get("/users/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await usersCollection.findOne(query);
			res.send(result);
		});
		// Load single user by email
		app.get("/users/:email", async (req, res) => {
			const email = req.email;
			const query = { email: email };
			const result = await usersCollection.findOne(query);
			res.send(result);
		});
		// Delete User
		app.delete("/users/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await usersCollection.deleteOne(query);
			res.send(result);
		});
		// Make Admin
		app.put("/user/admin/:email", async (req, res) => {
			const email = req.params.email;
			const filter = { email: email };
			const updateUser = {
				$set: { role: "admin" },
			};
			const result = await usersCollection.updateOne(filter, updateUser);
			res.send(result);
		});
		// find admin
		app.get("/user/admin/:email", async (req, res) => {
			const email = req.params.email;
			const user = await usersCollection.findOne({ email: email });
			const isAdmin = user.role === "admin";
			res.send({ admin: isAdmin });
		});
		// Load all review
		app.get("/reviews", async (req, res) => {
			const query = {};
			const cursor = reviewsCollection.find(query);
			const tools = await cursor.toArray();
			res.send(tools);
		});
		// add new review
		app.post("/review", async (req, res) => {
			const review = req.body;
			const result = await reviewsCollection.insertOne(review);
			res.send(result);
		});
		// Payment by stripe integration
		app.post("/create-payment-intent", async (req, res) => {
			const { totalPrice } = req.body;
			const amount = parseFloat(totalPrice * 100);
			const paymentIntent = await stripe.paymentIntents.create({
				amount: amount,
				currency: "usd",
				payment_method_types: ["card"],
			});
			res.send({ clientSecret: paymentIntent.client_secret });
		});
		// Payment post to the order
		app.patch("/order/:id", async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const payment = req.body;

			const updateDoc = {
				$set: {
					paid: true,
					transactionId: payment.transactionId,
				},
			};
			const updatedOrder = await ordersCollection.updateOne(filter, updateDoc);
			const payments = await paymentsCollection.insertOne(payment);

			res.send(updateDoc);
		});
		// jWT token
		app.post("/login", async (req, res) => {
			const user = req.body;
			const accessToken = jwt.sign(user, process.env.JSON_WEB_TOKEN, {
				expiresIn: "1d",
			});
			res.send({ accessToken });
		});
		// Load All Blog
		app.get("/blogs", async (req, res) => {
			const query = {};
			const cursor = blogCollection.find(query);
			const blogs = await cursor.toArray();
			res.send(blogs);
		});
		// Load by id
		app.get("/blogs/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await blogCollection.findOne(query);
			res.send(result);
		});
		// Detections api making here
		app.get("/secretKey", async (req, res) => {
			try {
				const secretKey = secretKeyCollection.find({});
				const result = await secretKey.toArray();
				res.send(result);
			} catch (error) {
				console.log(error);
			}
		});
		app.post("/detections", async (req, res) => {
			try {
				const detectionsData = req.body;
				const result = await detectionsCollection.insertOne(detectionsData);
				res.send(result);
			} catch (error) {
				console.log(error);
			}
		});
		app.get("/detections", async (req, res) => {
			try {
				const result = await detectionsCollection.find({}).toArray();
				res.send(result);
			} catch (error) {
				console.log(error);
			}
		});
		// No Routes
		app.all("*", (req, res) => {
			res.send("No Routes found!");
		});        
	} finally {
		// close
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log("Manufacturer is listing to port", port);
});