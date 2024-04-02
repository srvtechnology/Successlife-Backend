/*
import { FormsModule } from '@angular/forms';
|--------------------------------------------------------------------------
| Application Entry Point and Required Library
|--------------------------------------------------------------------------
|
*/
const result        = require('dotenv').config();
const port          = process.env.APP_PORT || 8000;
const host          = process.env.APP_HOST ||'http://127.0.0.1';
const express       = require('express');
const morgan        = require('morgan');
const rfs           = require('rotating-file-stream')
const path          = require('path');
const bodyParser    = require('body-parser');
const cors          = require('cors');
const app           = express();
const fs            = require('fs');
const moment        = require('moment');



// 

/*
|--------------------------------------------------------------------------
| Application Log Generation
|--------------------------------------------------------------------------
|
*/

// create a rotating write stream
var accessLogStream = rfs(`access-${moment().format('YYYY-MM-DD')}.log`, {
    path: path.join(__dirname, 'log')
})
app.use(morgan('common', { stream: accessLogStream }))

/*
|--------------------------------------------------------------------------
| Application Helper and Kernal Library
|--------------------------------------------------------------------------
|
*/

require('./app/helper/functions');
require('./app/helper/string');
require('./app/helper/date');
require('./app/console/kernal');
require('./app/console/scheduler');

require('./test.js');

/*
|--------------------------------------------------------------------------
| Application Http Request Installation
|--------------------------------------------------------------------------
|
*/
var corsOptions = {
    origin: process.env.CORS_ALLOW_URL,
    allowedHeaders: [
       'Content-Type',
       'Authorization',
       'Accept',
       'x-www-form-urlencoded',
       'api_key'
    ],
    credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


/*
|--------------------------------------------------------------------------
| Application Sattic path  Installation
|--------------------------------------------------------------------------
|
*/
app.use(express.static(path.join(__dirname,'public')));

/*
|--------------------------------------------------------------------------
| Application  View engine Installation
|--------------------------------------------------------------------------
|
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*
|--------------------------------------------------------------------------
| Application Provider Registration
|--------------------------------------------------------------------------
|
*/
require('./app/provider/RouteServiceProvider')(app);
require('./app/provider/PassportServiceProvider')(app);

/*
|--------------------------------------------------------------------------
| Application Node Server Installation
|--------------------------------------------------------------------------
|
*/



if(_.toBoolean(getConfig('app.secure'))){
    var options = {
        key: fs.readFileSync(process.env.SSLKEY),
        cert: fs.readFileSync(process.env.SSLPEM),
        requestCert: true,
        rejectUnauthorized: false
    };
    var server = require('https').createServer(options, app);
    server.listen(port,(req,res,next) =>{
        console.log("\x1b[32m%s\x1b[0m" ,`Node server started on : <${host}:${port}>`);
    });
}else{
    var server = require('http').createServer(app);
    server.listen(port,(req,res,next) =>{
        console.log("\x1b[32m%s\x1b[0m" ,`Node server started on : <${host}:${port}>`);
    });
}