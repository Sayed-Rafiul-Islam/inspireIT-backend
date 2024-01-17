const varify = async (req,res) => {
    const email = req.user.email
    res.status(200).send({email : email})  

}

module.exports = {
    varify
}