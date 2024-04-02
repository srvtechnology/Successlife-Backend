const program    = require('commander');
const fs         = require('fs');
const mkdirp     = require('mkdirp');

const boilerplate_install = {

    createController: async function(name,method,api){

    let controller  = _.contain(name,'/') ? _.last(_.split(name,'/')) : name;

/******* Controller Boilerplate start ********/
let withMthodBolierPlate = `
const Validator   = Helper('validator');

const ${controller} = {

    index:function(req, res,next){

    },

    create:function(req, res,next){

    },

    store:function(req,res,next){

    },

    show:function(req, res,next){

    },

    edit:function(req,res,next){

    },

    update:function(req, res,next){ 
        
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = ${controller};`;

let apiBolierPlate = `
const Validator   = Helper('validator');

const ${controller} = {

    index:function(req, res,next){

    },

    store:function(req,res,next){

    },

    show:function(req, res,next){

    },

    update:function(req, res,next){ 
        
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = ${controller};`;


let withoutMthodBolierPlate = `
const Validator   = Helper('validator');

const ${controller} = {

}

module.exports = ${controller};`;


/******* Controller Boilerplate End ********/

        let controllerPath  = './app/controller/';
        let filePath        = `${controllerPath}${name}.js`;

        if(_.contain(name,'/')){
            let folderPath = name.split('/').slice(0,-1).join('/');
            folderPath = `${controllerPath}${folderPath}`
            mkdirp.sync(folderPath);
        }

        if(fs.existsSync(filePath)){
            console.info(`${name}.js already exists.`);
            return;
        };

        let BolierPlate = (api == true) ? apiBolierPlate : (
            (method == true) ? withMthodBolierPlate : withoutMthodBolierPlate
        );

        fs.writeFileSync(filePath,BolierPlate, function(err) {
            if(err) {
                return console.log(err);
            }
        }); 

        console.info(`${name}.js has been created successfully.`);
    },

    createModel: async function(name){

/******* Model Boilerplate start ********/

let model       = _.contain(name,'/') ? _.last(_.split(name,'/')) : name;
let table_name  = _.toPlural(_.snakeCase(model));

let modelBoilerPlate = `
const bookshelf= Config('database');

module.exports = bookshelf.model('${model}',{

    hasTimestamps : true,

    tableName : '${table_name}',
});`

/******* Model Boilerplate End ********/
        let modelPath   = './app/model/';
        let filePath    = `${modelPath}${name}.js`;

        if(_.contain(name,'/')){
            let folderPath = name.split('/').slice(0,-1).join('/');
            folderPath = `${modelPath}${folderPath}`
            mkdirp.sync(folderPath);
        }

        if(fs.existsSync(filePath)){
            console.info(`${name}.js already exists.`);
            return;
        };

        fs.writeFileSync(filePath, modelBoilerPlate, function(err) {
            if(err) {
                return console.log(err);
            }
        }); 
        console.info(`${name}.js has been created successfully.`);
    },

    createMail : async function(name){

        let mailName  = _.contain(name,'/') ? _.last(_.split(name,'/')) : name;

let mailBoilerPlate = `
const Mail = Helper('mail');

module.exports = function(data){
    
    const mailOptions = {
        to:'example@gmail.com', 
        subject:'This is mail subject',
        template:{
            path : 'sample', //view path.
            data : data||{}  //mail data resources. 
        }
    };

    return Mail(mailOptions);
}`

        let mailPath   = './app/mail/';
        let filePath    = `${mailPath}${name}.js`;

        if(_.contain(name,'/')){
            let folderPath = name.split('/').slice(0,-1).join('/');
            folderPath = `${mailPath}${folderPath}`;
            mkdirp.sync(folderPath);
        }

        if(fs.existsSync(filePath)){
            console.info(`${name}.js already exists.`);
            return;
        };

        fs.writeFileSync(filePath, mailBoilerPlate, function(err) {
            if(err) {
                return console.log(err);
            }
        }); 

        console.info(`${name}.js has been created successfully.`);
    }
}


program
    .command('make:controller <name>')
    .option('--r, --resources','Add Default methods.')
    .option('--api, --api','Add Default API methods.')
    .description('create Controller.')
    .alias('c')
    .action((answer,option)=>{
        boilerplate_install.createController(answer,option.resources,option.api);
        process.exit(1);
    });

program
    .command('make:model <name>')
    .description('create Model.')
    .alias('m')
    .action((answer)=>{
        boilerplate_install.createModel(answer);
        process.exit(1);
    });

program
    .command('make:mail <name>')
    .description('create Mail.')
    .alias('mail')
    .action((answer)=>{
        boilerplate_install.createMail(answer);
        process.exit(1);
    });


module.exports = program






