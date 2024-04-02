const Mail = Helper('mail');

module.exports = function(details){
    let contactUsLink = `${getConfig('application').email.url}contact`;

    const mailOptions = { 
        to:details.user.user_name, 
        subject: `Cancellation of purchase status on SuccessLife Marketplace`,
        template:{
            path : 'order-cancel-mail-after24-hour', //view path.
            data : {details:details,contactUsLink:contactUsLink}
        }         
    };   
    return Mail(mailOptions);  
}           