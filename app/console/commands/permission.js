const program               = require('commander');
const inquirer              = require('inquirer');

var authentication_data     = Config('authentication');
var Permission              = Model('Permission');
var Role                    = Model('Role');
var Module                  = Model('Module');

let permissions_map                = authentication_data.permissions_map;
let role_structure                 = authentication_data.role_structure;
let single_user                    = authentication_data.single_user;
let common_permission_structure    = authentication_data.common_permission_structure;
let unique_permission_structure    = authentication_data.unique_permission_structure;


let permission_install = {

    role_install : function(){

        role_structure.forEach((role)=>{

            var name = _.toSlug(role);

            var save_data = {
                name            : name,
                display_name    : _.ucwords(role),
                is_single       : (single_user === role)
            }
            Role.where('name',name).fetch().then((role)=>{
                if(role){
                    return Role.where('name',name).save(save_data,{patch:true})
                }else{
                    return new Role(save_data).save();
                }
            }).then((role)=>{
                console.info(`Role ${name} install successfully.`)
            })
            .catch((error)=>{
                console.log(error)
            })
        });
    },

    module_install : function(){
        
        common_permission_structure.forEach((permission)=>{

            var module      = permission.module;
            let moduleData  = {
                name             : _ucwords(_.replace(module,'-',' ')),
                slug             : _.toSlug(module),
                is_active        : true,
                is_ticket_enable : permission.ticket
            }

            Module.where(_.pick(moduleData,'slug')).fetch().then((response)=>{
                if(!response){
                    return new Module(moduleData).save();
                }else{
                    return response;
                }
            }).then((module)=>{
                this.permission_install(permission,module);
            })
        });
    },

    permission_install : function(permission,module){

        var module_id   = module.get('id');
        var module_slug = module.get('slug');
        
        permission.access.forEach((map_key)=>{

            var access_key      = permissions_map.filter(v => v.access == map_key);
            var name            = (`${access_key[0].name}-${module_slug}`);
            var display_name    = _.ucwords(_.replace(name,'-',' '));
    
            var save_data = {
                name            : name,
                module_id       : module_id,
                display_name    : display_name
            }
    
            Permission.where('name',name).fetch().then((permission)=>{
                if(permission){
                    return Permission.where('name',name).save(save_data,{patch:true})
                }else{
                    return new Permission(save_data).save();
                }
            })
            .then((permission)=>{
                console.info(`Permissions ${name} install successfully.`)
            })
            .catch((error)=>{
                console.log(error)
            })
        });
    }
}


let permission_program = program
    .command('permission-install')
    .description('Install permission seeds')
    .alias('pi')
    .action(()=>{
        inquirer.prompt({
            input   :'confirm',
            name    :'confirm',
            message :'Do you really want to install permissions (Y|N) ?',
        }).then((answer)=>{
            if(['Y','N'].indexOf(answer.confirm) === -1){
                console.info('Please select between Y|N');
            }else{
                if(answer.confirm == 'Y'){
                    permission_install.role_install();
                    permission_install.module_install();
                }else{
                    process.exit(1);
                }
            }
        })
    });

module.exports = permission_program;


