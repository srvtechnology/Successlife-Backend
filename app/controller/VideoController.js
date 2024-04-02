const Video   = Model('Video');
const Validator   = Helper('validator');

const VideoController = {

    index:function(req, res,next){
        let is_active                   = _.toBoolean(req.query.is_active);       
        let has_pagination              = _.toBoolean(req.query.pagination);        
        let limit                       = _.toBoolean(req.query.limit)    ? _.toInteger(req.query.limit)  : 10;
        let page                        = _.toBoolean(req.query.page)     ? _.toInteger(req.query.page)   : 1;        

        let video                       = Video.forge().orderBy('-id');

       
        if(is_active){
            video = video.where('is_active',1); 
        }
       
        if(has_pagination){
            let relation_params   = Object.assign({pageSize:limit,page:page});
            video              = video.fetchPage(relation_params);
        }else{
            video              = video.fetchAll();
        }

        video.then((videoDetails)=>{
            return res.status(200).json(res.fnSuccess(videoDetails));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store:async function(req,res,next){
        let formData    = req.body;
        let application = Config('application');

        var validation  = new Validator(formData,{
            youtube_id           :'required|string|maxLength:150',
            type                 :`required|in:${application.video_type.join(',')}`,
            created_by           :'required|integer',
            is_active            :'required|boolean',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        let saveVideo = {
            youtube_id        : formData.youtube_id, 
            type              : formData.type,
            created_by        : formData.created_by,
            is_active         : formData.is_active
        };      

        new Video(saveVideo).save().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        Video.where(findBy,findFor).fetch()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:function(req, res,next){ 
        let formData            = req.body;  
        let our_video_id    = req.params.id;                              

        let updateVideo = {
            youtube_id        : formData.youtube_id, 
            type              : formData.type,
            created_by        : formData.created_by,
            is_active         : formData.is_active
        }; 

        Video.where('id',our_video_id).save(updateVideo,{patch:true})       
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var our_video_id  = req.params.id;
        
        Video.where('id',our_video_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = VideoController;