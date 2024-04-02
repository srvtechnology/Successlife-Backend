const Validator     = Helper('validator');
const ProductOffer  = Model('ProductOffer');

const ProductOfferController = {

    index:function(req, res,next){

        let acceptOfferType  = ['courses','products']
        let is_active        = _.toBoolean(req.query.is_active);
        let offerable_type   = req.query.offerable_type || false;   
        let hasCourseId      = _.toInteger(req.query.course_id);
        
        let product_offer    = ProductOffer.forge().orderBy('-id');

        if(is_active){
            product_offer = product_offer.where('is_expired',false);
        }
        if(hasCourseId){
            product_offer = product_offer.where('offerable_id',req.query.course_id);
        }
        if(offerable_type && _.contain(acceptOfferType,offerable_type)){            
            product_offer = product_offer.where('offerable_type',offerable_type);
        }

        product_offer.fetchAll().then((offers)=>{
            return res.status(200).json(res.fnSuccess(offers));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){

        let formData        = req.body;
        let validation      = new Validator(formData,{
            offerable_type  :'required|in:products,courses',
            offerable_id    :'required|inDatabaseInput:offerable_type,id',
            discount_mode   :'required|in:percentage,fixed',
            discount        :'required|decimal',
            started_on      :'required|dateFormat:YYYY-MM-DD',
            ended_on        :'required|dateFormat:YYYY-MM-DD',
            is_expired      :'required|boolean',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if(await ProductOffer.whereRaw(`'${formData.started_on}' BETWEEN DATE(started_on) AND DATE(ended_on) and offerable_id = ${formData.offerable_id}`).count() != 0){
            return res.status(400).json(res.fnError(`Offer is already running!. `));
        }

        let offer_data = {
            offerable_type  :formData.offerable_type,
            offerable_id    :formData.offerable_id,
            discount_mode   :formData.discount_mode,
            discount        :formData.discount,
            started_on      :formData.started_on,
            ended_on        :formData.ended_on,
            is_expired      :formData.is_expired,
        };

        ProductOffer.where({
            offerable_type  :formData.offerable_type,
            offerable_id    :formData.offerable_id
        }).fetch().then((offer)=>{
            // if(offer){
            //     return offer.save(offer_data,{patch:true});
            // }else{
            //     return new ProductOffer(offer_data).save();
            // }
            return new ProductOffer(offer_data).save();
        }).then((offer)=>{
            return res.status(200).json(res.fnSuccess(offer));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){

        let acceptOfferType     = ['courses','products'];
        let offer_id            = req.params.id;
        let offerable_type      = req.query.offer_type || false;
        let offerable_id        = req.query.offer_id || false;
        let product_offer       = ProductOffer.forge().orderBy('-id');

        if(offerable_type && offerable_id && _.contain(acceptOfferType,offerable_type)){
            product_offer = product_offer.where({
                offerable_type  : offerable_type,
                offerable_id    : offerable_id
            });
        }else{
            product_offer = product_offer.where('id',offer_id);
        }
        
        product_offer.fetch().then((offer)=>{
            return res.status(200).json(res.fnSuccess(offer));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        
        let offer_id        = req.params.id;
        let formData        = req.body;
        let validation      = new Validator(formData,{
            offerable_type  :'in:products,courses',
            offerable_id    :'integer|inDatabaseInput:offerable_type,id',
            discount_mode   :'in:percentage,fixed',
            discount        :'decimal',
            started_on      :'dateFormat:YYYY-MM-DD',
            ended_on        :'dateFormat:YYYY-MM-DD',
            is_expired      :'boolean',
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let offer_data = _.pickBy({
            offerable_type  :formData.offerable_type,
            offerable_id    :formData.offerable_id,
            discount_mode   :formData.discount_mode,
            discount        :formData.discount,
            started_on      :formData.started_on,
            ended_on        :formData.ended_on,
            is_expired      :formData.is_expired,
        },_.identity);

        ProductOffer.where('id',offer_id).save(offer_data,{patch:true}).then((time)=>{
            return res.status(200).json(res.fnSuccess(time));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        let offer_id         = req.params.id;
        ProductOffer.where('id',offer_id).destroy({required:false}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = ProductOfferController;