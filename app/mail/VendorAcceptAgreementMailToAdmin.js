
const Mail = Helper('mail');

module.exports = function(formData,details){
  
    const mailOptions = { 
        to:'support.marketplace@successlife.com', 
        subject: `SuccessLife Agreement Accepted by ${details.profile.full_name} `,
        template:{
            path : 'vendor-accept-agreement-mail-to-admin', //view path.
            data : {formData:formData,details:details}
        },
        attachments: [
            {
             path: details.agreement_pdf
            }
        ]         
    }; 
    return Mail(mailOptions);  
}      