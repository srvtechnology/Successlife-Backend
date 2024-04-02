module.exports = function (req, res, next) {   

        var CryptoJS = require("crypto-js");   
        
        var bytes  = CryptoJS.AES.decrypt(decodeURIComponent(req.query.params), process.env.ENCRYPTION_KEY);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);       
       
        try{
            req.body  = JSON.parse(plaintext);;
        }
        catch(e){
            req.body = req.body;
        }        

    next();
}