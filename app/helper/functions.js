/*
|--------------------------------------------------------------------------
| Application Variable Define
|--------------------------------------------------------------------------
|
*/
global._ = require('lodash');
global._fs = require('fs');


/*/var/www/html/ssmarketplace/node/config/database.js
|--------------------------------------------------------------------------
| Application PATH Define Function
|--------------------------------------------------------------------------
|
*/
global.Config = function (config) {
    return require(`../../config/${config}`);
}

global.Model = function (Model) {
    return require(`../model/${Model}`);
}

global.Route = function (Route) {
    return require(`../../routes/${Route}`);
}

global.Helper = function (Helper) {
    return require(`../helper/${Helper}`);
}

global.Middleware = function (Middleware) {
    return require(`../middleware/${Middleware}`);
}

global.Controller = function (Controller) {
    return require(`../controller/${Controller}`);
}

global.Mail = function (mail) {
    return require(`../mail/${mail}`);
}

global.Root = function (path) {
    return `../../${path}/`;
}

global.Public = function (path) {
    return (`public/${path}`)
}

/*
|--------------------------------------------------------------------------
| Config Helper Function
|--------------------------------------------------------------------------
|
*/
global.getConfig = function (string) {

    try {
        if (!_.contain(string, '.')) {
            return Config(string);
        }
    } catch (e) {
        return null;
    }

    let stringAr = _.split(string, '.');
    let fileName = _.head(stringAr);
    let objPath = _.pull(stringAr, fileName);

    try {
        let fileObject = Config(fileName);

        _.each(objPath, (key) => {
            if (_.isEmpty(fileObject[key])) {
                fileObject = null;
            } else {
                fileObject = fileObject[key];
            }
        });

        return fileObject;
    } catch (e) {
        return null;
    }
}

global.appKey = function () {
    return getConfig('app.key');
}

global.dd = function (data) {
    if (getConfig('app.env') === 'development') {
        console.log(data);
    }
}

global.getEnv = function (key) {
    require('dotenv').config();
    return process.env[key];
}


/*
|--------------------------------------------------------------------------
| Application Global Helper Function
|--------------------------------------------------------------------------
|
*/

global.isJSONString = function (string) {
    try {
        JSON.parse(string);
    } catch (e) {
        return false;
    }
    return true;
}

global.encrypt = function (string) {
    var string = (typeof string !== 'string') ? JSON.stringify(string) : string;
    const Cryptr = require('cryptr');
    const cryptr = new Cryptr(appKey());
    return cryptr.encrypt(string);
}

global.decrypt = function (string) {
    const Cryptr = require('cryptr');
    const cryptr = new Cryptr(appKey());

    try {
        const decrypt = cryptr.decrypt(string.toString());
        const decryptData = isJSONString(decrypt) ? JSON.parse(decrypt) : decrypt;
        return decryptData;
    } catch (e) {
        return false;
    }
}

/*
|--------------------------------------------------------------------------
| Application Router Helper Function
|--------------------------------------------------------------------------
|
*/

global.routeList = function (routes, path) {

    var routeListAr = [];
    var path = path || '';

    let getRouteList = function (routes, prefix) {
        var prefix = prefix || '';
        _.each(routes.stack, (r) => {
            if (r.route) {
                let object = {
                    path: `${path}${prefix}${r.route.path}`,
                    method: (r.route.stack[0].method).toUpperCase(),
                }
                routeListAr.push(object)

            } else {
                getRouteList(r.handle, r.handle.prefix)
            }
        })
    }
    getRouteList(routes);

    return routeListAr;
}

/*
|--------------------------------------------------------------------------
| Gate Helper Function
|--------------------------------------------------------------------------
|
*/
global.makeTree = function (array, parent, tree) {
    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { id: 0 };

    var children = _.filter(array, function (child) { return child.parent_id == parent.id; });

    if (!_.isEmpty(children)) {
        if (parent.id == 0) {
            tree = children;
        } else {
            parent['children'] = children;
        }
        _.each(children, function (child) { makeTree(array, child) });
    }
    return tree;
}

/*
|--------------------------------------------------------------------------
| Gate Helper Function
|--------------------------------------------------------------------------
|
*/

global.hasPermission = function (name) {

    let jwtDecode = require('jwt-decode');
    let parentArguments = arguments.callee.caller;
    let req = parentArguments.arguments[0];
    let token = req.get('Authorization');

    if (!token) return false;

    let permissions = jwtDecode(token).permissions;
    if (!permissions) return false;

    if (name.indexOf('|') >= 0) {
        return !!name.split('|').filter(v => permissions.indexOf(v) >= 0).length;
    }

    if (name.indexOf(',') >= 0) {
        return (name.split(',').filter(v => permissions.indexOf(v) >= 0).length) === (name.split(',').length);
    }

    return permissions.indexOf(name) >= 0;
}


global.hasRole = function (name) {

    let jwtDecode = require('jwt-decode');
    let parentArguments = arguments.callee.caller;
    let req = parentArguments.arguments[0];
    let token = req.get('Authorization');

    if (!token) return false;

    let roles = jwtDecode(token).roles;

    if (!roles) return false;

    if (name.indexOf('|') >= 0) {
        return !!name.split('|').filter(v => roles.indexOf(v) >= 0).length;
    }

    if (name.indexOf(',') >= 0) {
        return (name.split(',').filter(v => roles.indexOf(v) >= 0).length) === (name.split(',').length);
    }

    return roles.indexOf(name) >= 0;
}


/*
|--------------------------------------------------------------------------
| Create Unique Slug
|--------------------------------------------------------------------------
|
*/

global.generateSlug = async function (collection, string, column) {

    if (_.isEmpty(string)) {
        return null;
    }

    string = _.toSlug(string);

    let is_exists = async function (collection, string, column) {
        let _is_exists = false;
        await collection.where((column || 'slug'), string).count().then((count) => {
            if (count > 0) {
                _is_exists = true
            }
        });
        return _is_exists;
    }

    let slug_exists = await is_exists(collection, string, column)

    if (slug_exists) {

        for (let i = 1; i <= 100; i++) {

            let stringChain = _.chain(string).split('-');
            let string_arr = stringChain.value();
            let last_item = stringChain.last().value();

            if (_.isDigit(last_item) && !_.isEmpty(last_item)) {
                string_arr[string_arr.length - 1] = i;
                string = _.join(string_arr, '-');
            } else {
                string = `${string}-${i}`;
            }
            slug_is_exists = await is_exists(collection, string, column);

            if (slug_is_exists == false) {
                return string;
            }
        }
    } else {
        return string;
    }
}

/*
|--------------------------------------------------------------------------
| Unique Value Check from the object
|--------------------------------------------------------------------------
|
*/

global.checkDuplicateInObject = async function (propertyName, inputArray) {
    let seenDuplicate = false,
        testObject = {};

    inputArray.map(function (item) {
        let itemPropertyName = item[propertyName];
        if (itemPropertyName in testObject) {
            testObject[itemPropertyName].duplicate = true;
            item.duplicate = true;
            seenDuplicate = true;
        }
        else {
            testObject[itemPropertyName] = item;
            delete item.duplicate;
        }
    });
    return seenDuplicate;
}
