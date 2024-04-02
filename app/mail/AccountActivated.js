const Mail = Helper('mail');

module.exports = function (data) {  

    let emailType = data.roles[0].name;
    
    if(emailType === 'vendor'){
        const mailOptions = {
            to: data.user_name,
            subject: 'Welcome to SuccessLife!! Inspire Millions. Ready to create a course?',
            template: { 
                path: 'vendor-activated', //view path.
                data: data || {}     //mail data resources. 
            }
        };
        return Mail(mailOptions); 
    }
    if(emailType === 'customer'){
        const mailOptions = {
            to: data.user_name,
            subject: 'Your account has been verified and activated. Explore the courses and start learning today.',
            template: {
                path: 'customer-activated', //view path.
                data: data || {}     //mail data resources. 
            }
        };
        return Mail(mailOptions);
    }
    if(emailType === 'reseller'){
        const mailOptions = {
            to: data.user_name,
            subject: 'Your account has been verified and activated',
            template: {
                path: 'reseller-activated', //view path.
                data: data || {}     //mail data resources. 
            }
        };
        return Mail(mailOptions);
    }
}