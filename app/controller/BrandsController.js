
const Validator   = Helper('validator');

const BrandsController = {

    index:function(req, res,next){
        
        let array = [{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/vendor-1.png"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/vendor-2.png"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/vendor-3.png"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/vendor-4.png"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/vendor-5.png"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/press_mentions_logo06.jpg"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/press_mentions_logo07.jpg"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/press_mentions_logo08.jpg"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/press_mentions_logo09.jpg"},{"icon":"https://s3-ap-southeast-1.amazonaws.com/marketplace.successlife.com/2019/7/press_mentions_logo10.jpg"}];

        return res.status(200).json(res.fnSuccess(array));

    },

    store:function(req,res,next){

    },

    show:function(req, res,next){

    },

    update:function(req, res,next){ 
        
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = BrandsController;