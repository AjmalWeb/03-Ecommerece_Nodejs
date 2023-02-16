// const createError = require('http-errors');
require("dotenv").config();
require("express-async-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const rolesRouter = require("./routes/roles");
const permsRouter = require("./routes/permissions");
const permsroleRouter = require("./routes/permission_role");
const authRouter = require("./routes/authRoutes");
const productRouter = require("./routes/products");
const userimgRouter=require('./routes/Userimg')

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true,
  allowedHeaders: [
    "set-cookie",
    "Content-Type",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials",
  ],
};



const app = express();

// app.use(cors());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json()); //allowing json data to be received from client
app.use(passport.initialize());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.join(__dirname, "public")));
//static Images Folder

app.use('/Images', express.static('./Images'))

app.use("/", indexRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/roles", rolesRouter);
app.use("/api/v1/permissions", permsRouter);
app.use("/api/v1/permissionsrole", permsroleRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/userimg",userimgRouter)

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
