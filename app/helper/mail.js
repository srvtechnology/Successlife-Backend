const nodemailer  = require('nodemailer');
const Email       = require('email-templates');
const MailConfig  = getConfig('app.mail');

const EmailTemp   = new Email({
    views: { 
        root: 'views/email' ,
        options : {
            extension:'ejs',
        }
    }
});


const defaultOption = {
    from    : `${MailConfig.from.name}<${MailConfig.from.address}>`,
    subject : '',
    text    : '',
    html    : ''
}

const transporter = nodemailer.createTransport({
    host: MailConfig.host,
    port: MailConfig.port,
    secure: false, 
    auth: {
        user: MailConfig.user_name,
        pass: MailConfig.password
    }

},defaultOption);


const sendMail = function(mailOptions){
    return new Promise(function(resolve, reject) {
        transporter.sendMail(mailOptions,(error, info)=>{
            if(error){
                reject(error);
            }else{
                resolve(info);
            }
        })
    });
}

module.exports =  function(mailOptions){

    mailOptions.to = _.isArray(mailOptions.to) ? mailOptions.to.join(',') : mailOptions.to;
    mailOptions.bcc = 'rituraj@matrixnmedia.com';

    if(mailOptions.template && typeof mailOptions.template === 'object'){

        let template = mailOptions.template;

        return EmailTemp.render((template.path||'/'),(template.data||{})).then((response)=>{
            mailOptions['html'] = response;
            mailOptions = _.omit(mailOptions,'template');
            return sendMail(mailOptions);
        })
        .then((response)=>{
            return response;
        })
        .catch((errors)=>{
            return errors;
        });
    }else{
        return sendMail(mailOptions);
    }
}


