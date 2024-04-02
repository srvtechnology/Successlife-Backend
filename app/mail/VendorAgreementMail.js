
const Mail = Helper('mail');

module.exports = function(formData,details){
  
    const mailOptions = { 
        to:details.user_name, 
        subject: `Successlife Agreement`,
        template:{
            path : 'vendor-agreement', //view path.
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