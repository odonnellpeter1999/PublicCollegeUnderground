const User = require('../models/user');


module.exports = (req) => {

    if(req.user == undefined) return false

    return true

}