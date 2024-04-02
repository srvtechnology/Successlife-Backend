const Validator         = Helper('validator');
const UserAnnouncement  = Model('UserAnnouncement');
const notificationAlert = Helper('notification-alert');
const Profile  = Model('Profile');

const UserAnnouncementController = {

    index:function(req, res,next){

        let relationData         = [];
        let has_pagination      = _.toBoolean(req.query.pagination);
        let limit               = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let user_id             = _.toInteger(req.query.user_id) ? req.query.user_id : false;
        let user                = _.toBoolean(req.query.user) ? req.query.user : false;
        let string              = req.query.string || false;

        let userAnnouncement    =  UserAnnouncement.forge().orderBy('-id');           

        if(string){
            userAnnouncement = userAnnouncement.where(function () {
                this.where('title', 'like', `%${string}%`)
                    .orWhere('description', 'like', `%${string}%`)                            
            })
        }

        if(user_id)
        {   
            userAnnouncement = userAnnouncement.where('user_id',user_id)
        }

        if(user){
            relationData.push('user');
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {   pageSize:limit,page:page    } ,
                {   withRelated: relationData   }              
            );
            userAnnouncement = userAnnouncement.fetchPage(relation_params);
        }
        else
        {            
            userAnnouncement = userAnnouncement.fetchAll(Object.assign(
                {withRelated:relationData})
            );           
        }


        userAnnouncement
        .then((announcements)=>{
            return res.status(200).json(res.fnSuccess(announcements));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let validation      = new Validator(formData,{
            title       :'required|string|maxLength:250',
            slug        :'required|string|maxLength:250|unique:user_announcements',
            description :'required|string',
            user_id     :'required|integer|inDatabase:users,id',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let announcement_data = _.pickBy({
            title       :formData.title,
            name        :formData.name,
            slug        :formData.slug,
            description :formData.description,
            user_id     :formData.user_id,
        },_.identity)

        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before create anouncement.'));
        }

        new UserAnnouncement(announcement_data).save().then((announcement)=>{
            notificationAlert.announcementNotify(announcement_data,'customer',announcement.id);
            return res.status(200).json(res.fnSuccess(announcement));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let announcement_id = req.params.id;

        UserAnnouncement.where('id',announcement_id).fetch().then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let announcement_id = req.params.id;
        let formData        = req.body;
        let validationRule  = {
            title       :'string|maxLength:250',
            slug        :'string|maxLength:250|unique:user_announcements',
            description :'string',
            user_id     :'integer|inDatabase:users,id',
        }
        
        let validation      = new Validator(formData,validationRule);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let announcement_data = _.pickBy({
            title       :formData.title,
            name        :formData.name,
            slug        :formData.slug,
            description :formData.description,
            user_id     :formData.user_id,
        },_.identity)

        UserAnnouncement.where('id',announcement_id).save(announcement_data,{patch:true}).then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let announcement_id  = req.params.id;

        UserAnnouncement.where('id',announcement_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = UserAnnouncementController;