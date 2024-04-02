const User      = Model('User');
const Category  = Model('Category');
const Course    = Model('Course/Course');

const TestController = {

    index: async function(req,res,next){

        let data = [{
            id: 1,
            name : 'Soumik',
            age : 22
        },
        {
            id: 2,
            name : 'Soumik',
            age : 22
        },
        {
            id:3,
            name : 'Soumik',
            age : 22
        }]


        Course.forge().whereExistIn('categories',{'category_id':[1]}).fetchAll({debug:true}).then((response)=>{
            return res.status(200).json(response);
        })

        
    },
    
    create:function(req,res,next){
        return res.status(200).json({data:'create'});
    },

    store: function(req,res,next){
        
        new User().createDemo(req.body).then((response)=>{
            console.log(response);
            return res.status(200).json({data:response});
        })

    },

    show: function(req,res,next){
        return res.status(200).json({data:'show'});
    },

    edit: function(req,res,next){
        return res.status(200).json({data:'edit'});
    },

    update: function(req,res,next){
        return res.status(200).json({data:'update'});
    },

    destroy: function(req,res,next){
        return res.status(200).json({data:'destroy'});
    },
}

module.exports = TestController;
