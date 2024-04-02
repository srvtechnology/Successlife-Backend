const Mail = Helper('mail');

module.exports = function(contact){
    
    const mailOptions = {
        to:getConfig('application.email.contact'), 
        subject:`${contact.get('email')} has been contacted.`,
        template:{
            path : 'contact',
            data : {contact:contact}
        }
    };

    return Mail(mailOptions);
}