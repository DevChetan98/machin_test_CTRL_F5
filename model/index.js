const dbConfig=require("../config/db.config.js");
const Sequelize=require("sequelize")
const sequelize=new Sequelize(dbConfig.DB,dbConfig.USER,dbConfig.PASSWORD,{
host:dbConfig.HOST,
dialect:dbConfig.dialect,
operatorsAliases:false,
pool:{
    max:dbConfig.pool.max,
    min:dbConfig.pool.min,
    acquire:dbConfig.pool.acquire,
    idle:dbConfig.pool.idle
}
});
const db={}
db.sequelize=Sequelize;
db.sequelize= sequelize;

//Database connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
module.exports=db;