const ejsToHtml = Helper('ejs-to-html');
const htmlToPDF = Helper('html-to-pdf');
const moment = require('moment');
const AWS = require('aws-sdk');
const Bucket  = getEnv('AWS_BUCKET');
const ACL = getEnv('AWS_ACL');
const OrderConfiramtion = Mail('OrderConfiramtion');

AWS.config.update({ 
    accessKeyId: getEnv('AWS_ACCESS_KEY'),
    secretAccessKey: getEnv('AWS_SECRATE_KEY')
});

const generateInvoice = {
    
    invoice: function (dataObj) {

        ejsToHtml
        .toHTML('./views/invoice.ejs',{details:dataObj,moment:moment})
        .then((html)=>{
            let options = { format: 'Letter',orientation:"portrait", quality:75,fitToPage:false,"width": "280mm",height: '396mm' };
            
            let savePath = Public(`images/invoice/${'slm-invoice-' + moment().format('YYYYMMDDHHmmSS') + '.pdf'}`);
            
            htmlToPDF
            .toPDF(html, options, savePath)
            .then(function (response) {   

                if(!_.isNull(response.filename)){     

                    return new Promise(function(resolve, reject) {

                        if(!_fs.existsSync(response.filename)){
                            reject('File not found!');
                        } 

                        _fs.readFile(response.filename, (err, data) => { 
                            if(err){
                                reject(err);
                            }

                            let fileName        = _.last(_.split(savePath,'/'));                        
                            let base64data      = new Buffer(data, 'binary');

                            let s3 = new AWS.S3();                        
                            s3.putObject({
                                Bucket: Bucket,
                                Key:  `${new Date().getFullYear()}/${new Date().getMonth()+1}/invoice/${fileName}`,
                                Body: base64data,
                                ACL:   ACL  
                            },function (error, data) {
                                if(error){
                                    reject(error);
                                }else{   

                                    _fs.unlinkSync(savePath);  
                                    
                                    let attatchmentLink = `https://s3-${getEnv('AWS_REGION')}.amazonaws.com/${Bucket}/${new Date().getFullYear()}/${new Date().getMonth()+1}/invoice/${fileName}`;

                                    OrderConfiramtion(dataObj,attatchmentLink);
                                
                                    resolve(attatchmentLink);
                                }
                            });                       
                        })                        
                    })                                      
                }
            }, function (error) {
                console.error(error);
            });
        })
        .catch((err)=>{
            console.log(err);
        })
    }    
}

module.exports = generateInvoice;

