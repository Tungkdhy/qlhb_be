var Web3 = require("web3");
var auth = require("../abis/Auth.json");
var {User} = require('../models/index')
const checkRole = (role) => {
    console.log(role);
  return async (req, res, next) => {
    try {
      const {username} = req.query
      const user = await User.findOne({
        where: { username: username},
      });
      const web3 = new Web3("HTTP://127.0.0.1:7545");
      const networkId = await web3.eth.net.getId();
      const networkData = auth.networks[networkId];
      const au = new web3.eth.Contract(auth.abi, networkData.address);
      const roleCT = await au.methods.getRole(user.privatekey).call();
      if(roleCT === role ){
        next()
      }
      else{
        res.status(403).send("Forbidden")
      }
    } catch (e) {
        res.send("bad request")
    }
  };  
};
module.exports = {
  checkRole,
};
