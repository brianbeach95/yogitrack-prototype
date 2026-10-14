const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");

// Serve static files from the public dir
app.use(express.static("public", { index: false }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "yogitrack-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  }
}));

app.use("/api/user", require("./routes/userRoutes.cjs"));
app.use("/api/instructor", require("./routes/instructorRoutes.cjs"));
app.use("/api/customer", require("./routes/customerRoutes.cjs"));
app.use("/api/package", require("./routes/packageRoutes.cjs"));
app.use("/api/class", require("./routes/classRoutes.cjs"));
app.use("/api/sale", require("./routes/saleRoutes.cjs"));
app.use("/api/attendance", require("./routes/attendanceRoutes.cjs"));
app.use("/api/report", require("./routes/reportRoutes.cjs"));

const clientDist = path.join(__dirname, "client", "dist");

app.use(express.static(clientDist));

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
});



// Start the web server
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}...`);
  console.log('Open http://localhost:8080/index.html in your browser to view the app.');
});
