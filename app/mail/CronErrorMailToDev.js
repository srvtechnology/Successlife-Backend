
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(type,data){
    

    const mailOptions = {
        to:`rituraj@matrixnmedia.com`,        
        subject: `Cron Error run for ${type} -${moment().format('YYYY-MM-DD HH:mm:ss')} ` ,
        template:{
            path : 'cron-error-mail-to-dev', //view path.
            data : { details : data}
        }
    };

    return Mail(mailOptions);
}   