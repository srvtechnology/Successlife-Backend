
const Mail = Helper('mail');

module.exports = function(details,userEmail){
    
    const mailOptions = {
        to:userEmail,
        subject: `New message from ${details.tutor_name} on SuccessLife` ,
        template:{
            path : 'course-welcome-confirmation', //view path.
            data : {details:details}
        }
    };

    return Mail(mailOptions);
}   