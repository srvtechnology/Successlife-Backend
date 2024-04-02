const Mail = Helper('mail');

module.exports = function(password_reset,user_data,token_link){
   
    const mailOptions = {
        to:password_reset.get('user_name'), 
        subject: 'Reset Password',
        template:{
            path : 'password-reset',
            data : {
                token_link:_.replace(token_link,':token',password_reset.get('token')),
                uname :  ( user_data.profile.full_name === undefined) ? password_reset.get('user_name').split('@')[0] : user_data.profile.full_name
            }
        }
    };

    return Mail(mailOptions);
}