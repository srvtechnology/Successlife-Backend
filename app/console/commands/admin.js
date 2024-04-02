const program               = require('commander');
const inquirer              = require('inquirer');
const bcrypt                = require('bcryptjs');
const Permission            = Model('Permission');
const Role                  = Model('Role');
const User                  = Model('User');
const authentication_data   = Config('authentication');
const single_user           = authentication_data.single_user;


const admin_install = {

    adminUserInstall: async function(){

        let that      = this;
        let user_data = {
            email       : 'admin@successlife.com',
            password    : bcrypt.hashSync('123456',10),
            mobile_no   : '9874995306',
            avatar      : 'https://via.placeholder.com/150',
            is_active   :  true
        };
        let has_role  = false;
 
        await Role.where({name:single_user}).fetch().then((admin_role)=>{
            if(admin_role){
                has_role = true
            }else{
                console.log('Please Do role and permission setup first [node_srm:pi]');
                process.exit(1);
            }
        })

        if(has_role == true){
            new User(user_data).save().then((user)=> {
                console.info('admin user installed');
                that.userRoleInstall(user);
            }).catch((errors)=>{
                console.info(errors);
            });
        }  
    },

    userRoleInstall : function(user){

        let user_id = user.get('id');
 
        Role.where({name:single_user}).fetch().then((admin_role)=>{
            return admin_role.users().attach(user_id);
        }).then((user_role)=>{
            console.info('admin role installed');
            this.rolePermissionInstall();
        });
    },

    rolePermissionInstall:async function(){

        var permissions_ids = [];

        await Permission.fetchAll({columns:'id'}).then((permissions)=>{
            permissions_ids = permissions ? permissions.map(v=>v.id) : [];
        });

        Role.where('name',single_user).fetch().then((role)=>{
            role.permissions().detach();
            return role.permissions().attach(permissions_ids);
        }).then((role_permission)=>{
            console.info('Permission setup complete for admin role.')
            process.exit(1);
        })
        .catch((errors)=>{
            console.log(errors)
        })
    }
}

 
const admin_program = program
    .command('admin-install')
    .description('Install admin and permission.')
    .alias('api')
    .action(()=>{
        inquirer.prompt({
            input   :'confirm',
            name    :'confirm',
            message :'Do you really want to install admin and permissions (Y|N) ?',
        }).then((answer)=>{
            if(['Y','N'].indexOf(answer.confirm) === -1){
                console.info('Please select between Y|N');
            }else{
                if(answer.confirm == 'Y'){
                    admin_install.adminUserInstall();
                }else{
                    process.exit(1);
                }
            }
        })
    });

module.exports = admin_program;


