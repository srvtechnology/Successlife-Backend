const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
var toPdf = require("office-to-pdf");
const Bucket    = getEnv('AWS_BUCKET');
const AWS = require('aws-sdk');
const targetPath    = `${new Date().getFullYear()}/${new Date().getMonth()+1}/TutorAgreement/`;

AWS.config.update(
    { 
        accessKeyId: getEnv('AWS_ACCESS_KEY'),
        secretAccessKey: getEnv('AWS_SECRATE_KEY')
    }
);
const profileData = {};

const docWriteToPdf = {

    profileData,
    targetPath,

    setVendorProfileData: function(data){        
        this.profileData = data;
        return this;
    },
    exec: function(){ 
        let profileData         = this.profileData;
        let getOriginalFile     = Public(`TutorAgreement/TutorAgreement.docx`);
        let docWriteFilePath    = Public(`TutorAgreement/`);
        let targetPath          = this.targetPath;
        let tutorName           = `${profileData.tutor_name}`;

        return new Promise(function(resolve, reject) {
            let content = fs.readFileSync(getOriginalFile, 'binary');

            let zip = new JSZip(content);
            let doc = new Docxtemplater();
            doc.loadZip(zip);
            doc.setData(this.profileData);          

            try {            
                doc.render();
            }            
            catch (error) {                          
                reject(error);
            }
            let buf = doc
                .getZip()
                .generate({type: 'nodebuffer'});  
            
            fs.writeFileSync(`${docWriteFilePath}${tutorName}.docx`, buf);

            if(!_fs.existsSync(`${docWriteFilePath}${tutorName}.docx`)){
                return 'error';
            }    
            var wordBuffer = fs.readFileSync(`${docWriteFilePath}${tutorName}.docx`);

            toPdf(wordBuffer).then(
                (pdfBuffer) => {
                    fs.writeFileSync(`${docWriteFilePath}${tutorName}.pdf`, pdfBuffer);

                    if(!fs.existsSync(`${docWriteFilePath}${tutorName}.pdf`)){
                        reject('file not found');
                    }  
                    
                    resolve(`${docWriteFilePath}${tutorName}.pdf`);

                    // fs.readFile(`${docWriteFilePath}/${tutorName}.pdf`, (err, data) => {
                    //     var base64data = new Buffer(data, 'binary');
        
                    //     var s3 = new AWS.S3();                        
                    //     s3.putObject({
                    //         Bucket: Bucket,
                    //         Key:  `${targetPath}${tutorName}.pdf`,
                    //         Body: base64data,
                    //         ACL:  getEnv('AWS_ACL')             
                    //     },function (error, data) {                                                               
                    //         if(error){
                    //             reject(error);
                    //         }else{
                               
                    //             resolve(`https://s3-${getEnv('AWS_REGION')}.amazonaws.com/${Bucket}/${targetPath}${tutorName}.pdf`);
                    //         }
                    //     });
                    // })

                }, (err) => {
                    reject(err);
                }
            )            
        })
    }
}

module.exports = docWriteToPdf; 