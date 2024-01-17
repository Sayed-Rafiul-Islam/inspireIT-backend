const { verifyJwt } = require("../utils/varifyJWT");

const userAuthViaToken = async (req, res, next) => {

    const accessToken = req.query.accessToken;
    if (!accessToken) {
        return res.status(401).send({message : "Forbidden Access"});
    }

  try {
    const user = await verifyJwt(accessToken)
    if (!user) {
      res.status(403).send({message : "Unauthorized Access"});
        
    } 
    req.user = user
    next()
    
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
};

module.exports = {
  userAuthViaToken,
};