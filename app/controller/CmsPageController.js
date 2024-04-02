const Validator   = Helper('validator');
const CmsPage     = Model('CmsPage');

const CmsPageController = {

    index:function(req, res,next){
        let string          = req.query.string || false;
        let cmsPage         = CmsPage.forge();

        if(string){
            cmsPage = cmsPage.where(function () {
                this.where('name', 'like', `%${string}%`)
                    .orWhere('title', 'like', `%${string}%`)     
                    .orWhere('content', 'like', `%${string}%`)     
                    .orWhere('sample_content', 'like', `%${string}%`)          
                    .orWhere('description', 'like', `%${string}%`)  
                    .orWhere('keywords', 'like', `%${string}%`)    
            })
        }

        cmsPage.orderBy('-id').fetchAll().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req, res,next){

        let formData    = req.body;

        let validation  = new Validator(formData,{
            name            :'required|string|maxLength:250',
            slug            :'required|string|alphaDash|maxLength:255|unique:cms_pages',
            title           :'required|string|maxLength:250',
            content         :'required|string',
            sample_content  :'required|string',
            description     :'required|string',
            keywords        :'required|string',
            css_class       :'string',
            icon            :'string',
            is_active       :'required|boolean',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let cmspage_data = _.pickBy({
            name            : formData.name,
            title           : formData.title,
            slug            : formData.slug,
            content         : formData.content,
            sample_content  : formData.sample_content,
            description     : formData.description,
            keywords        : formData.keywords,
            css_class       : formData.css_class,
            icon            : formData.icon,
            is_active       : formData.is_active,
        },_.identity)

        new CmsPage(cmspage_data).save().then((cms_page)=>{
            return res.status(200).json(res.fnSuccess(cms_page));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        CmsPage.where(findBy,findFor).fetch().then((cms_page)=>{
            return res.status(200).json(res.fnSuccess(cms_page));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update:async function(req, res,next){ 

        let page_id         = req.params.id;
        let formData        = req.body;
        let validationRules = {
            name            :'required|string|maxLength:250',
            title           :'required|string|maxLength:250',
            content         :'required|string',
            sample_content  :'required|string',
            description     :'required|string',
            keywords        :'required|string|maxLength:250',
            css_class       :'string',
            icon            :'string',
            is_active       :'required|boolean',
        }

        if(formData.slug){
            validationRules['slug'] = 'required|string|alphaDash|maxLength:255|unique:cms_pages'
        }

        let validation  = new Validator(formData,validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let cmspage_data = _.pickBy({
            name            : formData.name,
            title           : formData.title,
            content         : formData.content,
            sample_content  : formData.sample_content,
            description     : formData.description,
            keywords        : formData.keywords,
            css_class       : formData.css_class,
            icon            : formData.icon,
            is_active       : formData.is_active,
        },_.identity)

        if(formData.slug){
            cmspage_data['slug'] = formData.slug.toLowerCase()
        }

        CmsPage.where('id',page_id).save(cmspage_data,{patch:true}).then((cmspage)=>{
            return res.status(200).json(res.fnSuccess(cmspage));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
        
    },

    destroy:function(req,res,next){

        let page_id = req.params.id;

        CmsPage.where('id',page_id).destroy({required:false}).then((cmspage)=>{
            return res.status(200).json(res.fnSuccess(cmspage));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = CmsPageController;