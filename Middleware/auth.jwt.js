const jwt=require('jsonwebtoken');
const config=require('../config/auth.config.js');

verifyToken=(req,res,next)=>{
    let token=req.cookies.access_token;
    if(!token){
        return res.send({status:404,data:[],token:null,message:"No token provided!"})
    }
  
    jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
        if(err){
            return res.send({status:404,data:[],message:"Invalid access token!"});
        }
        req.userId=decoded.id;
        req.email=decoded.email;
        req.username=decoded.username;
        next();
    });
};

const authJwt={
    verifyToken:verifyToken
}
module.exports=authJwt;
