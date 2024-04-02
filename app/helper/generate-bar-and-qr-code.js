const bwipjs = require('bwip-js');
const Bucket    = getEnv('AWS_BUCKET');
const AWS = require('aws-sdk');
const ACL = getEnv('AWS_ACL');
const QRCode = require('qrcode');
const moment = require('moment');
AWS.config.update({ 
    accessKeyId: getEnv('AWS_ACCESS_KEY'),
    secretAccessKey: getEnv('AWS_SECRATE_KEY')
});
const AttendeeDetail = Model('AttendeeDetail');
const mailNotification = Helper('mail-notification');
const AttendeeInformation = Model('AttendeeInformation');

const generateBarAndQrCode = {
    createBarCode: function (detail) {

        let targetPath      = `barcode/${new Date().getFullYear()}/${new Date().getMonth()+1}/`;       

        if(!_.isObject(detail)){
            dd('data is not a object');
            return false;
        }

        _.map(detail.attendee_details,function(v){           

            bwipjs.toBuffer({
                bcid: 'code128',       // Barcode type
                text: `${v.ticket_number}`,    // Text to encode
                scale: 3,              // 3x scaling factor
                height: 10,            // Bar height, in millimeters
                includetext: true,     // Show human-readable text
                textxalign: 'center',  // Always good to set this
            }, function (err, png) {
               
                if (err) {
                    dd(err)
                } else {

                    try {
                        let savePath = Public(`images/bar_code/bar-${v.ticket_number}.png`);

                        _fs.writeFileSync(savePath, png, 'binary', { mode: 0o755 });
                        if(!_fs.existsSync(savePath)){
                            dd('File not found!');
                        }                        
                        _fs.readFile(savePath, (err, data) => { 
                            if(err){
                                dd(err);
                            } else {
                                let fileName        = _.last(_.split(savePath,'/'));                        
                                let base64data      = Buffer.from(data, 'binary');

                                let s3 = new AWS.S3(); 
                                s3.upload({
                                    Bucket: Bucket,
                                    Key:  `${targetPath}${fileName}`,
                                    Body: base64data,
                                    ACL:   ACL  
                                },function (error, data) {                               
                                    if(error){
                                        dd(error);
                                    }else{   
                                        _fs.unlinkSync(savePath); 
                                        let udpateAttendeeDetails = {
                                            "bar_code":data.Location
                                        }                                    
                                        AttendeeDetail
                                        .where('id',v.id)
                                        .save(udpateAttendeeDetails,{patch:true})
                                        .then((response)=>{ 

                                            v['bar_code'] = data.Location;   
                                            generateBarAndQrCode.createQrCode(v,detail.event_details,detail.event_details.product,detail.payment_category,detail.event_details.country,detail.event_details.state,detail.event_details.city);
                                        })
                                        .catch((err)=>{
                                            dd(err)
                                        })                                                                       
                                    }
                                });  
                            }     
                        })
                    } catch (err) {                        
                        dd(err);
                    }
                }
            });   
        });    
    },
    createQrCode: async function(attendeeData,eventDetail,product,paymentCategory,country,state,city){      
       
        let qrSavePath = Public(`images/qr_code/qr-attendeeId-${attendeeData.id}.png`);
        let qrTargetPath  = `qrcode/${new Date().getFullYear()}/${new Date().getMonth()+1}/`;

        let attendeeInfo ={
            eventName:product.title,
            firstName: attendeeData.first_name,
            lastName: attendeeData.last_name,
            email: attendeeData.email,            
            phoneNumber:`${attendeeData.phone_code}${attendeeData.phone_number}`,
            category:paymentCategory.title,           
            eventStartDate:moment(eventDetail.start_date).format('YYYY-MM-DD'),
            eventEndDate:moment(eventDetail.end_date).format('YYYY-MM-DD')
          };        
          
        try { 
            QRCode.toDataURL(JSON.stringify(attendeeInfo), function (err, url) {   
                let base64Data = url.replace(/^data:image\/png;base64,/, "");
                
                _fs.writeFileSync(qrSavePath, base64Data, 'base64', { mode: 0o755 });
                if(!_fs.existsSync(qrSavePath)){

                    dd('File not found!');
                
                 }else{ 

                    _fs.readFile(qrSavePath, (err, data) => {

                        if(err){
                            dd(err);
                        }
                        let fileName        = _.last(_.split(qrSavePath,'/'));  
                       
                        let base64data      = Buffer.from(data, 'binary');
                        let s3 = new AWS.S3(); 
                        s3.upload({
                            Bucket: Bucket,
                            Key:  `${qrTargetPath}${fileName}`,
                            Body: base64data,
                            ACL:   ACL  
                        },function (error, data) {                               
                            if(error){
                                dd(error);
                            }else{   
                                _fs.unlinkSync(qrSavePath); 
                                let udpateAttendeeDetails = {
                                    "qr_code":data.Location
                                }
                                AttendeeDetail
                                .where('id',attendeeData.id)
                                .save(udpateAttendeeDetails,{patch:true})
                                .then((response)=>{                                 
                                    attendeeData['qr_code'] = data.Location;   
                                    mailNotification.eventTicket(attendeeData,eventDetail,product,paymentCategory,country,state,city)
                                    
                                    AttendeeInformation
                                    .where('id',attendeeData.attendee_id)
                                    .save({"ticket_sent_status":1},{patch:true})
                                })
                                .catch((err)=>{
                                    dd(err)
                                })                                                               
                            }
                        });  
                    })   
                }     
            })
        }
        catch(e){
            dd(e);
        }
    }
}

module.exports = generateBarAndQrCode;

