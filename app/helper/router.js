const express  = require('express');
const Router   = express.Router();

const routerParamSetup  = function(){

    var path           =  arguments[0];
    var middleware     =  arguments[2] ? arguments[1] : [];
    var controller     =  arguments[2] ? arguments[2] : arguments[1];
    
    if(controller.indexOf('@') >= 0){
        let [controllerName, methodName] = controller.split('@');
        controller = Controller(controllerName)[methodName];
    }else{
        controller = Controller(controller);
    }

    return [path,middleware,controller];
};


express.application._get = express.Router._get = function(argument1,argument2,argument3) {
    let [Path,Middleware,Method] = routerParamSetup(argument1,argument2,argument3)
    this.get(Path,Middleware,Method);
};

express.application._post = express.Router._post = function(argument1,argument2,argument3) {
    let [Path,Middleware,Method] = routerParamSetup(argument1,argument2,argument3)
    this.post(Path,Middleware,Method); 
};

express.application._put = express.Router._put = function(argument1,argument2,argument3) {
    let [Path,Middleware,Method] = routerParamSetup(argument1,argument2,argument3)
    this.put(Path,Middleware,Method);
};

express.application._delete = express.Router._delete = function(argument1,argument2,argument3) {
    let [Path,Middleware,Method] = routerParamSetup(argument1,argument2,argument3)
    this.delete(Path,Middleware,Method);
};

express.application._all = express.Router._all = function(argument1,argument2,argument3) {
    let [Path,Middleware,Method] = routerParamSetup(argument1,argument2,argument3)
    this.all(Path,Middleware,Method);
};

express.application._resource = express.Router._resource = function(argument1,argument2,argument3) {

    let [Path,Middleware,Controller] = routerParamSetup(argument1,argument2,argument3);

    this.get(`${Path}`,Middleware,Controller.index);
    this.get(`${Path}/create`,Middleware,Controller.create);
    this.post(`${Path}`,Middleware,Controller.store);
    this.get(`${Path}/:id`,Middleware,Controller.show);
    this.get(`${Path}/:id/edit`,Middleware,Controller.edit);
    this.put(`${Path}/:id`,Middleware,Controller.update);
    this.delete(`${Path}/:id`,Middleware,Controller.destroy);
};

express.application._resource_api = express.Router._resource_api = function(argument1,argument2,argument3) {

    let [Path,Middleware,Controller] = routerParamSetup(argument1,argument2,argument3);

    this.get(`${Path}`,Middleware,Controller.index);
    this.post(`${Path}`,Middleware,Controller.store);
    this.get(`${Path}/:id`,Middleware,Controller.show);
    this.put(`${Path}/:id`,Middleware,Controller.update);
    this.delete(`${Path}/:id`,Middleware,Controller.destroy);
};


express.application._group = express.Router._group = function(arg1, arg2) {

    var fn, path;

    if (arg2 === undefined) {
        path = "/";
        fn = arg1;
    }
    else {
        path = arg1;
        fn = arg2
    }

    var router = express.Router();
    fn(router);

    router.prefix = path;

    this.use(path, router);
    return router;
};


module.exports = Router;