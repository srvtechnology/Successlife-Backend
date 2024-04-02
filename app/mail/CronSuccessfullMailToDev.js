
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(type){   

    const mailOptions = {
        to:`rituraj@matrixnmedia.com`,        
        subject: `Cron Successfully run for "${type}" - ${moment().format('YYYY-MM-DD HH:mm:ss')} ` ,
        template:{
            path : 'cron-successfull-mail-to-dev', //view path.
            data : ''
        }
    };

    return Mail(mailOptions);
}   