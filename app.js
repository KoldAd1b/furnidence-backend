require("dotenv").config();
require("express-async-errors");
const path = require("path");
const express = require("express");
const app = express();
const Product = require("./Model/productModel");
const fs = require("fs");

const morgan = require("morgan");
// Middleware for parsing cookies in oncoming request
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUploadHandler = require("express-fileupload");

// Security packages
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

// Routes
const authRoutes = require("./routes/authenticationRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
// Connecting to database
const connectDB = require("./db/connect");
// Middleware
const notFound = require("./middleware/not-found");
const errorMiddleware = require("./middleware/error-handler");
// Auth middleware
const { authenticateUser } = require("./middleware/authentication");

// Secruity middleware

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 60,
  })
);

app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());

// Logging MiddleWare
app.use(morgan("tiny"));
app.use(express.json());
// Passing in signature to cookies so client cannot modify it
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUploadHandler());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", authenticateUser, userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/orders", orderRoutes);

app.use(notFound);

app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_DB_URI_STRING);
    app.listen(PORT, console.log("Server listening on port " + PORT));

    // fs.readFile(
    //   path.join(__dirname, "mockData", "products.json"),
    //   (err, data) => {
    //     if (err) throw err;
    //     const products = JSON.parse(data);
    //     Product.create(products).then((products) => {
    //       console.log("Succesfully added the products");
    //     });
    //   }
    // );
  } catch (error) {}
};

startServer();
