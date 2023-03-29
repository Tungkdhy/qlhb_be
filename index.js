var express = require("express");
var {
  connection,
  User,
  Teacher,
  Student,
  Subject,
} = require("./src/models/index");
var { checkRole } = require("./src/middlewares/CheckRole");
const app = express();
var Web3 = require("web3");
var des = require("./src/abis/Decentragram.json");
var tran = require("./src/abis/Transcript.json");
var auth = require("./src/abis/Auth.json");
var bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

      au.methods
        .getRole(user.privatekey)
        .call()
        .then((data) =>
          res.send({
            ...user,
            data,
          })
        );
    }
  } catch (e) {
    console.log(e);
    res.status(400).send("Bad request");
  }
});
app.post("/addUser", async (req, res) => {
  try {
    const { address, role, username, password } = req.body;
    await User.create({
      username,
      password,
      privatekey: address,
    });
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
app.post("/point", checkRole("teacher"), async (req, res) => {
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
      year,
      semester,
    } = req.body;
    const user = await User.findOne({ where: { username: username } });
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    decentragram.methods
      .mark(
        idTeacher,
        idStudent,
        idSubject,
        {
          mouth,
          minute,
          end,
          frequent,
        },
        year,
        semester
      )
      .send({ from: user.privatekey, gas: 1000000 })
      .on("transactionHash", (hash) => {
        res.send("add user successful");
      });
  } catch (e) {
    console.log(e);
  }
});
app.put("/point", checkRole("teacher"), async (req, res) => {
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
app.get("/point", checkRole("admin"), async (req, res) => {
  try {
    a;
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    const imagesCount = await decentragram.methods.pointCount().call();
    let images = [];
    for (var i = 1; i <= imagesCount; i++) {
      const image = await decentragram.methods.points(i).call();
      const {
        id,
        idTeacher,
        idStudent,
        idSubject,
        point,
        author,
        year,
        semester,
      } = image;
      const student = await Student.findByPk(idStudent);
      const teacher = await Teacher.findOne({
        where: { id: idTeacher },
      });
      images = [
        ...images,
        {
          id,
          idTeacher,
          idStudent,
          teacher: teacher.dataValues,
          student: student.dataValues,
          idSubject,
          point,
          author,
          year,
          semester,
        },
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
app.get("/point/student/:id", async (req, res) => {
  try {
    // const user = await User.findOne({ where: { username: username } });
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    decentragram.methods
      .getPointByIdStudent(req.params.id)
      .call(
        { returnType: "mapping", keyType: "uint", valueType: "Point" },
        async (error, result) => {
          if (error) {
            console.error(error);
            return;
          }
          let points = [];
          for (var i = 0; i < result.length; i++) {
            const teacher = await Teacher.findByPk(result[i].idTeacher);
            const subject = await Subject.findByPk(result[i].idSubject);
            points = [
              ...points,
              {
                id: result[i].id,
                idStudent: result[i].idStudent,
                idTeacher: result[i].idTeacher,
                semester: result[i].semester,
                year: result[i].year,
                teacher: teacher.dataValues,
                subject: subject.dataValues,
                point: {
                  mouth: result[i].point.mouth,
                  end: result[i].point.end,
                  frequent: result[i].point.frequent,
                  minute: result[i].point.minute,
                },
                idSubject: result[i].idSubject,
                author: result[i].author,
              },
            ];
          }
          res.status(200).send(points);
        }
      );
  } catch (e) {
    res.status(400).send("Bad request");
  }
});
app.get("/point/subject/:id", async (req, res) => {
  try {
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);
    console.log(req.params.id);
    decentragram.methods
      .getPointByIdSubject(req.params.id)
      .call(
        { returnType: "mapping", keyType: "uint", valueType: "Point" },
        async (error, result) => {
          if (error) {
            console.error(error);
            return;
          }
          let points = [];
          for (var i = 0; i < result.length; i++) {
            const teacher = await Teacher.findByPk(result[i].idTeacher);
            const subject = await Subject.findByPk(result[i].idSubject);
            const student = await Student.findByPk(result[i].idStudent);

            points = [
              ...points,
              {
                id: result[i].id,
                idStudent: result[i].idStudent,
                idTeacher: result[i].idTeacher,
                semester: result[i].semester,
                year: result[i].year,
                teacher: teacher.dataValues,
                subject: subject.dataValues,
                student: student.dataValues,
                point: {
                  mouth: result[i].point.mouth,
                  end: result[i].point.end,
                  frequent: result[i].point.frequent,
                  minute: result[i].point.minute,
                },
                idSubject: result[i].idSubject,
                author: result[i].author,
              },
            ];
          }
          res.status(200).send(points);
        }
      );
  } catch (e) {
    res.status(400).send("Bad request");
  }
});
app.get("/student", async (req, res) => {
  try {
    const data = await Student.findAll();
    res.status(200).send(data);
  } catch (e) {
    res.status(400).send("Fail");
  }
});
app.post("/student", async (req, res) => {
  try {
    const data = await Student.create({
      ...req.body,
    });
    res.send(data);
  } catch (e) {
    res.status(400).send("Bad request");
  }
});
app.get("/teacher", async (req, res) => {
  try {
    const data = await Teacher.findAll();
    res.status(200).send(data);
  } catch (e) {
    res.status(400).send("Bad request");
  }
});
app.post("/teacher", async (req, res) => {
  try {
    const data = await Teacher.create({
      ...req.body,
    });
    res.status(200).send(data);
  } catch (e) {
    res.status(400).send("Bad request");
  }
});
app.get("/events", checkRole("admin"), async (req, res) => {
  try {
    const {type} = req.query
    const web3 = new Web3("HTTP://127.0.0.1:7545");
    const networkId = await web3.eth.net.getId();
    const networkData = tran.networks[networkId];
    const decentragram = new web3.eth.Contract(tran.abi, networkData.address);

    const events = await decentragram.getPastEvents(type === "PointCreated"?"PointCreated":"PointChange", {
      fromBlock: 0,
      toBlock: "latest",
    });
    let evs = [];
    for (var i = 0; i < events.length; i++) {
      const student = await Student.findByPk(events[i].returnValues.idStudent);
      const teacher = await Teacher.findByPk(events[i].returnValues.idTeacher);
      const subject = await Subject.findByPk(events[i].returnValues.idSubject);
      evs = [
        ...evs,
        {
          id: events[i].returnValues.id,
          idStudent: events[i].returnValues.idStudent,
          idTeacher: events[i].returnValues.idTeacher,
          semester: events[i].returnValues.semester,
          year: events[i].returnValues.year,
          point: events[i].returnValues.point,
          idSubject: events[i].returnValues.idSubject,
          author: events[i].returnValues.author,
          student:student.dataValues,
          teacher:teacher.dataValues,
          subject:subject.dataValues
        },
      ];
    }
    res.status(200).send(evs)
  } catch (e) {
    res.status(400).send("Bad request");
  }
});
app.listen("3001", () => {
  console.log("sever run port 3001");
});
