const Category  = Model('Category');
const Validator = Helper('validator');

const CategoryController = {

    index:function(req, res,next){

        let is_active                   = _.toBoolean(req.query.is_active);
        let hasParentId                 = _.toBoolean(req.query.parent_id);
        let tree_view                   = _.toBoolean(req.query.tree);
        let has_pagination              = _.toBoolean(req.query.pagination);
        let fetch_children              = _.toBoolean(req.query.children) ?  {withRelated:'children'} : {};
        let fetch_parent                = _.toBoolean(req.query.parent)? {withRelated:'parent'} : {};
        let limit                       = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                        = _.toBoolean(req.query.page)   ? _.toInteger(req.query.page)   : 1;

        let fetchFeaturedCourseCategory = _.toBoolean(req.query.featured_course_category);
        let string                      = req.query.string || false;
        let fetchType                   = _.toBoolean(req.query.type) ? req.query.type : false;
        let fetchCreatedBy              =  _.toInteger(req.query.created_by) ? req.query.created_by : false;
        let parentIdWithChild           = req.query.parentIdWithChild || false;
        let fetchParentId               = _.toInteger(req.query.fetchParentId) ? req.query.fetchParentId : false;

        let category                    = Category.forge().orderBy('-id');

        if(string){
            category = category.where(function () {
                this.where('categories.name', 'like', `%${string}%`)
                    .orWhere('categories.description', 'like', `%${string}%`)
            })
        }

        if(fetchType){
            category = category.where('categories.type',fetchType)
        }

        if(is_active){
            category = category.where('categories.is_active',1);
        }

        if(hasParentId){
            category = category.where('categories.parent_id',req.query.parent_id);
            category = category.where('categories.is_active',1);
        }

        if(fetchCreatedBy){
            category = category.where('categories.created_by',fetchCreatedBy);
        }
        if(tree_view && !hasParentId){
            category.fetchAll().then((response)=>{
                return res.status(200).json(res.fnSuccess(makeTree(response.toJSON())));
            }).catch((errors)=>{
                return res.status(400).json(res.fnError(errors));
            });
            return;
        }
        if(fetchFeaturedCourseCategory){
            category = category
            .select('categories.*')
            .query(function(qb){
                qb.count('category_course.category_id as count')
                qb.innerJoin('category_course', 'category_course.category_id', 'categories.id')

                qb.innerJoin('courses', 'courses.id', 'category_course.course_id')
                qb.whereRaw('courses.status =  "publish" and courses.is_featured = 1 and courses.is_active = 1 and is_delete = 0 and courses.approved_status = 1' );
                qb.groupBy('category_course.category_id')
            })

        }

        if(parentIdWithChild){
            category = category.where('categories.parent_id',fetchParentId);
            category = category.where('categories.is_active',1);
            category = category
                        .select('categories.*')
                        .query((q)=>{
                            q.count('child.parent_id as children')
                            q.leftJoin('categories as child' ,'child.parent_id','categories.id')
                            q.groupBy('categories.id')
                        })

        }
        // if(treeViewPlusChild){

        //     category.fetchAll().then((response)=>{
        //         return res.status(200).json(res.fnSuccess(makeTree(response.toJSON())));
        //     }).catch((errors)=>{
        //         return res.status(400).json(res.fnError(errors));
        //     });
        //     return;
        // }
        if(has_pagination){
            let relation_params   = Object.assign({pageSize:limit,page:page},fetch_children,fetch_parent);
            category              = category.fetchPage(relation_params);
        }else{
            category              = category.fetchAll(Object.assign(fetch_children,fetch_parent));

        }

        category.then((categories)=>{
            return res.status(200).json(res.fnSuccess(categories));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    store: async function(req,res,next){
        let application     = Config('application');
        let formData    = req.body;

        var validation  = new Validator(formData,{
            name        :'required|string|maxLength:255|unique:categories',
            icon        :'string|maxLength:255',
            description :'string',
            parent_id   :'integer',
            type        :`required|in:${application.category_type.join(',')}`,
            created_by  : 'required'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        let save_category = {
            name        : formData.name,
            icon        : formData.icon,
            slug        : await generateSlug(Category,formData.name),
            description : formData.description,
            parent_id   : formData.parent_id,
            type        : formData.type,
            is_active   : 1,
            created_by  : formData.created_by
        };

        new Category(save_category).save().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    show:function(req, res,next){
        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        Category.where(findBy,findFor).fetch().then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){
        let application     = Config('application');

        let formData         = req.body;
        let category_id      = req.params.id;
        let validationRules  = {
            name        :'required|string|maxLength:255',
            icon        :'string|maxLength:255',
            description :'string',
            parent_id   :'integer',
            type        :`required|in:${application.category_type.join(',')}`,
            created_by  : 'required'
        }

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if(formData.created_by !=1){ /* here id 1 is for admin */
            if(await Category.where('id',category_id).where('created_by',formData.created_by).count() === 0){
                return res.status(400).json(res.fnError(`You don't have a permission to edit this category`));
            }
        }

        let save_category = {
            name        : formData.name,
            icon        : formData.icon,
            description : formData.description,
            parent_id   : formData.parent_id,
            is_active   : 1,
            type        : formData.type,
            created_by  : formData.created_by
        };

        Category.where('id',category_id).save(save_category,{patch:true}).then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var category_id  = req.params.id;

        Category.where('id',category_id).destroy({required:false}).then((category)=>{
            category.where('parent_id',category_id).save({parent_id:0},{patch:true})
            return category;
        }).then((category)=>{
            return res.status(200).json(res.fnSuccess(category));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}


module.exports = CategoryController;
