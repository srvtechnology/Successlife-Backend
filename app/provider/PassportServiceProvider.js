const passport      = require('passport');
const JwtStrategy   = require('passport-jwt').Strategy;
const ExtractJwt    = require('passport-jwt').ExtractJwt;
const User          = Model('User');

module.exports = function(app){

    app.use(passport.initialize());
    app.use(passport.session());

    var opts = {};
    
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    opts.secretOrKey    = appKey();

    passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
        let user =  jwt_payload.user;
        User.where('id',user.id).fetch().then((user)=>{
            if(user){
                return done(null,user);
            }else{
                return done(null,false);
            }
        }).catch((error)=>{
            return done(error,false);
        })
    }))
}