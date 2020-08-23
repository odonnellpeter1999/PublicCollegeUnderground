const User = require('../models/user');


module.exports = (req) => {

    if(req.user == undefined) return false

     User.findById(req.user).then( function(results,err) {

        if(err) throw new Error("User not found during auth procedure")

        if(results == null) return false


    })

return true

}