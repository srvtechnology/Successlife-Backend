const jwtDecode  = require('jwt-decode');

const GateMiddleware = {

    methodPermission : {
        GET      :'read',
        POST     :'create',
        PUT      :'update',
        DELETE   :'delete'
    },

    hasPermission:function(permission_name){

        var that    = this;
        var string  = permission_name;

        var message = {
            status      :'error',
            message     :'SERVER-PERMISSION::You dont have authorization to access this page.',
            permission  : string
        };
        
        return function (req, res, next) {
            
            let method  = req.method.toUpperCase();

            if(_.contain(permission_name,'*-')){
                string              = _.replace(permission_name,'*',that.methodPermission[method]);
                message.permission  = string;
            }

            let token  = req.get('Authorization');

            if(!token){
                return res.status(403).json(message);
            }

            let decodeToken = jwtDecode(token);
            if(!decodeToken.permissions){
                return res.status(403).json(message);
            }

            let permissions = decodeToken.permissions
            if(permissions.indexOf(string) >= 0){
                next();
            }else{
                return res.status(403).json(message);
            }
        }
    },

    hasRole:function(string){

        var message = {
            status  :'error',
            message :'SERVER-ROLE::You dont have authorization to access this page.',
            role    : string
        };
        
        return function (req, res, next) {

            let token  = req.get('Authorization');

            if(!token){
                return res.status(403).json(message);
            }

            let decodeToken = jwtDecode(token);
            if(!decodeToken.roles){
                return res.status(403).json(message);
            }

            let roles = decodeToken.roles;
            if(roles.indexOf(string) >= 0){
                next();
            }else{
                return res.status(403).json(message);
            }
        }
    }
}


module.exports = GateMiddleware;