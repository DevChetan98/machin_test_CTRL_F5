
console.log("process.env.JWT_KEY : ",process.env.JWT_KEY)
module.exports = {
    secret: process.env.JWT_KEY,
};