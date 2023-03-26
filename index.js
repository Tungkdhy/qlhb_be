var express = require("express");
var { connection, User } = require("./src/models/index");
const app = express();
var Web3 = require("web3");
var des = require("./src/abis/Decentragram.json");
var tran = require("./src/abis/Transcript.json");
var auth = require("./src/abis/Auth.json");
var bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  next();
});
app.get("/", async (req, res) => {
  try {
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = des.networks[networkId];
    const decentragram = new web3.eth.Contract(des.abi, networkData.address);
    const imagesCount = await decentragram.methods.imageCount().call();
    let images = [];
    for (var i = 1; i <= imagesCount; i++) {
      const image = await decentragram.methods.images(i).call();
      images = [...images, image];
    }
    res.send(images);
  } catch (e) {
    res.send(e);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username: username, password: password },
    });

    if (user) {
      const web3 = new Web3("HTTP://127.0.0.1:7545");
      const networkId = await web3.eth.net.getId();
      const networkData = auth.networks[networkId];
      const au = new web3.eth.Contract(auth.abi, networkData.address);
    
       au.methods.getRole(user.privatekey).call().then(data=>res.send({
        ...user,data
       }))

    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad request");
  }
});
app.post("/addUser", async (req, res) => {
  try {
    const { address, role, username,password } = req.body;
    await User.create({
      username,
      password,
      privatekey:address
    })
    console.log("tun");
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = auth.networks[networkId];
    const au = new web3.eth.Contract(auth.abi, networkData.address);
    au.methods
      .addUser(role)
      .send({ from: address, gas: 1000000 })
      .on("transactionHash", (hash) => {
        res.send("add user successful");
      });
  } catch (e) {
    res.send("Not found");
  }
});
app.post("/point", async (req, res) => {
  try {
    const {
      idTeacher,
      idStudent,
      idSubject,
      mouth,
      minute,
      end,
      frequent,
      username,
    } = req.body;
    const user = await User.findOne({ where: { username: username } });
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    decentragram.methods
      .mark(idTeacher, idStudent, idSubject, {
        mouth,
        minute,
        end,
        frequent,
      })
      .send({ from: user.privatekey, gas: 1000000 })
      .on("transactionHash", (hash) => {
        res.send("add user successful");
      });
  } catch (e) {
    console.log(e);
  }
});
app.put("/point", async (req, res) => {
  try {
    const { id, username, mouth, minute, end, frequent } = req.body;
    const user = await User.findOne({ where: { username: username } });
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    decentragram.methods
      .changePoint(id, {
        mouth,
        minute,
        end,
        frequent,
      })
      .send({ from: user.privatekey, gas: 1000000 })
      .on("transactionHash", (hash) => {
        res.send("change point successful");
      });
  } catch (e) {
    res.send(e);
  }
});
app.get("/point", async (req, res) => {
  try {
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    const imagesCount = await decentragram.methods.pointCount().call();
    let images = [];
    for (var i = 1; i <= imagesCount; i++) {
      const image = await decentragram.methods.points(i).call();
      const { id, idTeacher, idStudent, idSubject, point, author } = image;
      images = [
        ...images,
        { id, idTeacher, idStudent, idSubject, point, author },
      ];
    }
    const data = images.filter(
      (item) => item.idTeacher === req.query.isTeacher && item.idSubject === "1"
    );
    res.send(images);
  } catch (e) {
    res.send(e);
  }
});
app.listen("3001", () => {
  console.log("sever run port 3001");
});
