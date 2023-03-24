var {Sequelize,DataTypes} = require('sequelize')
const connection = new Sequelize({
    dialect:"mysql",
    host:"localhost",
    username:"root",
    database:"qlhb",
    password:"secret",
    logging:false,
})
connection.authenticate().then(() => {
    console.log('Connection has been established successfully.');
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });
 
 const User = connection.define("users", {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    privatekey: {
        type: DataTypes.STRING,
    },
 });
 
 connection.sync().then(() => {
    console.log('Book table created successfully!');
 }).catch((error) => {
    console.error('Unable to create table : ', error);
 });
 module.exports={
    connection,
    User
 }