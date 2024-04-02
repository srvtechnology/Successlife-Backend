const download  = require('download');
const s3Uploader= require('s3-uploader');
const Bucket    = getEnv('AWS_BUCKET');
const awsConfig = {
    accessKeyId     : getEnv('AWS_ACCESS_KEY'),
    secretAccessKey : getEnv('AWS_SECRATE_KEY'),
    region          : getEnv('AWS_REGION'),
    ACL             : getEnv('AWS_ACL'),
}


const size          = []
const appends       = {}
const imageObject   = [];
const targetPath    = `${new Date().getFullYear()}/${new Date().getMonth()+1}/`;
const imageKey      = 'image';
const resizeableImg = ''; 

const imageResizeModule = {

    size,
    appends,
    targetPath,
    imageObject,
    imageKey,
    resizeableImg,


    setResizeableImg : function(path){
        this.resizeableImg = path;
        return this;
    },

    setImageKey : function(key){
        this.imageKey = key;
        return this;
    },

    setDataObject : function(objects){
        this.imageObject = objects;
        return this;
    },

    setTargetPath : function(path){
        this.targetPath = path;
        return this;
    },

    setSize : function(resizeData){
        this.size = resizeData;
        return this;
    },

    setAppends :function(appendData){
        this.appends = appendData;
        return this;
    },

    get: async function(){

        let resizeArray     = this.size;
        let targetPath      = this.targetPath;
        let resizeableImg   = this.resizeableImg;
        let fileName        = _.last(_.split(resizeableImg,'/'));
        let savePath        = Public(`images/resize/${fileName}`);
        let resizerObject   = [];

        _.each(resizeArray,(option)=>{
    
            let object = {
                maxHeight   : option.height||'',
                maxWidth    : option.width ||'',
                format      : 'jpg',
                suffix      :`-${option.height}x${option.width}`,
                quality     : option.quality || 80,
                aspect      : option.aspect || '3:2!h',
                type        : option.key || 'image'
                
            }
            resizerObject.push(object);
        });

        const client = new s3Uploader(Bucket,{
            aws         : _.assign(awsConfig,{path:targetPath}),
            cleanup     : {
                versions: true,
                original: true
            },
            original    : {
                awsImageAcl: 'private'
            },
            versions    : resizerObject
        });

        await download(resizeableImg).then(data => {
            _fs.writeFileSync(savePath, data);
        });

        if(!_fs.existsSync(savePath)){
            return null;
        }

        return new Promise(function(resolve, reject) {
            client.upload(savePath,{},function (error, Response, meta) {
                if(error){
                    reject(error);
                }else{
                    resolve(_.filter(Response,(v) => _.isUndefined(v.original)));
                }
            });
        });
    },

    exec : function(){

        let imageObject = _.isArray(this.imageObject) ? this.imageObject : [this.imageObject];
        let resizeArray = this.size;
        let targetPath  = this.targetPath;
        let appends     = this.appends;
        let imageKey    = this.imageKey;
        let that        = this;

        let dataParams = {
            resizeArray : resizeArray,
            targetPath  : targetPath,
            appends     : appends,
            imageKey    : imageKey 
        }

        return Promise.all(imageObject.map((v)=>{
            return that.doResizeAndUpload(v,dataParams)
        }))
    },

    doResizeAndUpload: function(imageObject,dataParams){

        let resizeArray = dataParams.resizeArray;
        let targetPath  = dataParams.targetPath;
        let appends     = dataParams.appends;
        let imageKey    = dataParams.imageKey;
        let imageLink   = imageObject[imageKey];
    
        if(_.isUndefined(imageLink)){
            return imageObject;
        }
     
        var s3FilePath      =  targetPath;
        let fileName        = _.last(_.split(imageLink,'/'));
        let savePath        = Public(`images/resize/${fileName}`);
        let resizerObject   = [];

        _.each(resizeArray,(option)=>{
    
            let object = {
                maxHeight   : option.height||'',
                maxWidth    : option.width ||'',
                format      : 'jpg',
                suffix      :`-${option.height}x${option.width}`,
                quality     : option.quality || 80,
                aspect      : option.aspect || '3:2!h',
                type        : option.key || 'image'
                
            }
            resizerObject.push(object);
        });
    
        const client = new s3Uploader(Bucket,{
            aws         : _.assign(awsConfig,{path:s3FilePath}),
            cleanup     : {
                versions: true,
                original: true
            },
            original    : {
                awsImageAcl: 'private'
            },
            versions    : resizerObject
        });

        return new Promise(function(resolve, reject) {

            download(imageLink).then(data => {

                _fs.writeFileSync(savePath, data);

                if(!_fs.existsSync(savePath)){
                    reject(imageObject)
                }

                client.upload(savePath,{},function (error, Response, meta) {
                    if(error){
                        reject(error);
                    }else{
                        ImageObject = _.assign(imageObject, appends);
                        _.each(resizeArray,(v)=>{
                            let imagePath = _.head(_.filter(Response,(o)=> v.key === o.type))
                            ImageObject[v.key] = imagePath.url
                        });
                        resolve(ImageObject);
                    }
                });
            })
            .catch((err)=>{
                reject(err);
            })

        });
    },
}

module.exports = imageResizeModule; 


