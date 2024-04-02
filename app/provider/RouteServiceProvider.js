const webRoute          = Route('web');
const apiRoute          = Route('api');
const AuthMiddleware    = Middleware('AuthMiddleware');
const ApiMiddleware     = Middleware('ApiMiddleware');
const IpMiddleware      = Middleware('IpMiddleware');
const RequestMiddlware  = Middleware('RequestMiddlware');
const DecryptMiddleware  = Middleware('DecryptMiddleware');


const ExceptRoute = [
    '/api/login',
];

module.exports = function(app){

    app.get('/',ApiMiddleware,(req,res,next) =>{
        res.send(`Node JS Running on Port ${process.env.APP_PORT}`);
    });

    app.get('/routes',(req,res,next) =>{
        res.render('routes',{routes:routeList(apiRoute,'/api')});
    });

    app.use('/api',[
       // AuthMiddleware.Auth(ExceptRoute),  // To Make a user Authinticate. **
       // IpMiddleware,                         // To White List and Black List Ip address.
        ApiMiddleware,                        // To Bring API Response Funtion with MetaData.**
        RequestMiddlware,                     // To Log each request URL with details.
        // DecryptMiddleware,
    ],apiRoute);


    app.get('**',ApiMiddleware,(req,res,next) =>{
        return res.status(400).json(res.fnError('API url is wrong. please check the documentation.'));
    });
}

