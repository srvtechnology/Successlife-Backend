var passport    = require('passport');
var CryptoJS = require("crypto-js");

var AuthMiddleware = {

    Auth:function(ExceptRoute = null){

        return function(req, res, next){

            let getSxlAddressCheck = req.originalUrl.split('/');

            if(_.toBoolean(getConfig('app.secure'))){
                if(getSxlAddressCheck[3] === 'sxl-address-check'){
                    return next();
                }
            }
            else{
                if(getSxlAddressCheck[4] === 'sxl-address-check'){
                    return next();
                }
            }


            if(ExceptRoute.filter(v=>(_.isPatternMatch(req.originalUrl,v) || req.originalUrl === v)).length > 0){
                return next();
            }

            passport.authenticate('jwt', {session: false}, function(err, user, info) {

                if(user){
                    // console.log('test');
                    if(req.headers.api_key){
                        var bytes  = CryptoJS.AES.decrypt(decodeURIComponent(req.headers.api_key), process.env.ENCRYPTION_KEY);

                        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                        let currentDate = (new Date().getTime() ).toString();

                        try{
                            if(plaintext > process.env.ENCRYPTION_KEY + currentDate){
                                return next();
                            }
                            else{
                                return res.status(403).json({'status':'error','message':'Token mismatch or unauthorize access.'})
                            }
                        }
                        catch(e){
                            return res.status(403).json({'status':'error','message':'Token mismatch or unauthorize access.'})
                        }
                    }
                    else{
                        return res.status(403).json({'status':'error','message':'Token mismatch or unauthorize access.'})
                    }

                }
                else if(req.headers.api_key){                   
                    try{
                        var bytes  = CryptoJS.AES.decrypt(decodeURIComponent(req.headers.api_key), process.env.ENCRYPTION_KEY);

                        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                        let currentDate = (new Date().getTime() ).toString();

                        try{
                            if(plaintext > process.env.ENCRYPTION_KEY + currentDate){
                                return next();
                            }
                            else{
                                return res.status(403).json({'status':'error','message':'Token mismatch or unauthorize access.'})
                            }
                        }
                        catch(e){
                            return res.status(403).json({'status':'error','message':'Token mismatch or unauthorize access.'})
                        }
                    }
                    catch(e){
                        return res.status(403).json({'status':'error','message':'Invalid Api Key.'})
                    }
                }
                else{
                    return res.status(403).json({'status':'error','message':'Token mismatch or unauthorize access.'})
                }
            })(req, res, next)
        }
    }
}


module.exports = AuthMiddleware;