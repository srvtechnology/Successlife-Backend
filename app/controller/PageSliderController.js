const Validator   = Helper('validator');
const PageSlider  = Model('PageSlider');
const application = Config('application');

const PageSliderController = {

    index:function(req, res,next){

        let page        = req.query.page;
        let is_active   = _.toBoolean(req.query.is_active);
        let string      = req.query.string || false;

        let page_slider = PageSlider.forge().orderBy('-id');

        if(page){
            page_slider = page_slider.where('page',page);
        }

        if(is_active){
            page_slider = page_slider.where('is_active',true);
        }
        if(string){
            page_slider = page_slider.where(function () {
                this.where('page', 'like', `%${string}%`)
                    .orWhere('title', 'like', `%${string}%`)      
                    .orWhere('content', 'like', `%${string}%`)                   
            })
        }
        page_slider.fetchAll().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },
 
    store: async function(req,res,next){

        let formData    = req.body;

        let validation  = new Validator(formData,{
            page            :`required|in:${application.slider_page.join(',')}`,
            title           :'required|string|maxLength:250',
            content         :'string',
            thumbnail       :'required|url',
            button_1_title  :'string',
            button_2_title  :'string',
            button_1_link   :'string',
            button_2_link   :'string',
            is_active       :'required|boolean'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let slider_data = {
            page            : formData.page,
            title           : formData.title,
            content         : formData.content,
            thumbnail       : formData.thumbnail,
            button_1_title  : formData.button_1_title,
            button_2_title  : formData.button_2_title,
            button_1_link   : formData.button_1_link,
            button_2_link   : formData.button_2_link,
            is_active       : formData.is_active
        }

        new PageSlider(slider_data).save().then((slider)=>{
            return res.status(200).json(res.fnSuccess(slider));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    show:function(req, res,next){
        var slider_id  = req.params.id;

        PageSlider.where('id',slider_id).fetch().then((slider)=>{
            return res.status(200).json(res.fnSuccess(slider));
        }).catch((errors)=>{
            return res.status(200).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 

        let formData    = req.body;
        let slider_id   = req.params.id;

        let validation  = new Validator(formData,{
            page            :`in:${application.slider_page.join(',')}`,
            title           :'string|maxLength:250',
            content         :'string',
            thumbnail       :'url',
            button_1_title  :'string',
            button_2_title  :'string',
            button_1_link   :'string',
            button_2_link   :'string',
            is_active       :'boolean'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let slider_data = {
            page            : formData.page,
            title           : formData.title,
            content         : formData.content,
            thumbnail       : formData.thumbnail,
            button_1_title  : formData.button_1_title,
            button_2_title  : formData.button_2_title,
            button_1_link   : formData.button_1_link,
            button_2_link   : formData.button_2_link,
            is_active       : formData.is_active
        }

        PageSlider.where('id',slider_id).save(slider_data,{patch:true}).then((slider)=>{
            return res.status(200).json(res.fnSuccess(slider));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    destroy:function(req,res,next){
        var slider_id     = req.params.id;

        PageSlider.where('id',slider_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = PageSliderController;