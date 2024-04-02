const Profile = Model('Profile');
const Validator = Helper('validator');
const User = Model('User');



const ProfileController = {

    index: function (req, res, next) {

        let has_pagination = _.toBoolean(req.query.pagination);
        let limit = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;
        let profile = Profile.forge().orderBy('-id');

        if (has_pagination) {
            profile = profile.fetchPage({ pageSize: limit, page: page });
        } else {
            profile = profile.fetchAll();
        }

        profile.then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function (req, res, next) {

        let formData = req.body;
        let validation = new Validator(formData, {
            first_name: 'required|string|maxLength:250',
            middle_name: 'string|maxLength:250',
            last_name: 'required|string|maxLength:250',
            head_line: 'required|string|maxLength:250',
            biography: 'string',
            social_links: 'object',
            timezone: 'required|string|maxLength:250',
            address: 'required|string|maxLength:250',
            country_id: 'required|integer|inDatabase:countries,id',
            state_id: 'required|integer|inDatabase:states,id',
            city_id: 'required|integer|inDatabase:cities,id',
            user_id: 'required|integer|inDatabase:users,id',
            ethereum_address: 'required'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let profile_data = {
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            head_line: formData.head_line,
            biography: formData.biography,
            social_links: JSON.stringify(formData.social_links),
            timezone: formData.timezone,
            address: formData.address,
            country_id: formData.country_id,
            state_id: formData.state_id,
            city_id: formData.city_id,
            user_id: formData.user_id,
            ethereum_address:formData.ethereum_address
        }

        Profile.where('user_id', profile_data.user_id).fetch().then((user) => {
            if (user) {
                return user.save(_.omit(profile_data, 'user_id'), { patch: true });
            } else {
                return new Profile(profile_data).save();
            }
        }).then((profile) => {
            return res.status(200).json(res.fnSuccess(profile));
        }).catch((errors) => {
            return res.status(200).json(res.fnError(errors));
        });
    },

    show: function (req, res, next) {
        let fetch_user = _.toBoolean(req.query.user);
        let userRealtion;
        let updateByParams = ['user_id', 'id'];

        let searchBy = req.query.search_by ? (updateByParams.indexOf(req.query.search_by) >= 0 ? req.query.search_by : 'id') : 'id';
        let searchById = req.params.id;

        let fetchOrder = _.toBoolean(req.query.orders);

        let withrelated = [];
        
        //=================================================
        if (fetch_user) {                        
            withrelated.push('user');
            if(fetchOrder){
                let withrelatedOrder = {
                    'user.order': function (q) {
                        q.column('id', 'user_id', 'total_order_price_usd', 'total_order_price_sxl','total_order_price','ordered_on','order_status');
                    }
                };
                withrelated.push(withrelatedOrder);
            }
        }
        //=================================================
        //==Country
        let withrelatedCountry = {
            'country': function (q) {}
        };
        withrelated.push(withrelatedCountry);
        //=================================================
        //==State
        let withrelatedState = {
            'state': function (q) {}
        };
        withrelated.push(withrelatedState);
        //=================================================
        //==City
        let withrelatedCity = {
            'city': function (q) {}
        };
        withrelated.push(withrelatedCity);
        //=================================================
       
        Profile
        .where(searchBy, searchById)
        .fetch({withRelated:withrelated})
        .then((profile) => {
            return res.status(200).json(res.fnSuccess(profile));
        }).catch((errors) => {

            return res.status(400).json(res.fnError(errors));
        });
        //=================================================
    },

    update: async function (req, res, next) {

        let updateByParams = [
            'user_id', 'id'
        ];

        let updateBy = req.query.update_by ? (updateByParams.indexOf(req.query.update_by) >= 0 ? req.query.update_by : 'id') : 'id';
        let updatehById = req.params.id;

        let formData = req.body;
        let validation = new Validator(formData, {
            first_name: 'required|string|maxLength:250',
            middle_name: 'string|maxLength:250',
            last_name: 'required|string|maxLength:250',
            head_line: 'required|string|maxLength:250',
            biography: 'string',
            social_links: 'object',
            timezone: 'required|string|maxLength:250',
            address: 'required|string|maxLength:250',
            country_id: 'required|integer|inDatabase:countries,id',
            state_id: 'required|integer|inDatabase:states,id',
            city_id: 'required|integer|inDatabase:cities,id',
            user_id: 'required|integer|inDatabase:users,id',
            ethereum_address: 'required'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let profile_data = {
            first_name:  formData.first_name,
            middle_name:  formData.middle_name,
            last_name:  formData.last_name,
            head_line:  formData.head_line,
            biography:  formData.biography,
            social_links: JSON.stringify(formData.social_links),
            timezone:  formData.timezone,
            address:  formData.address,
            country_id:  formData.country_id,
            state_id:  formData.state_id,
            city_id:  formData.city_id,
            user_id:  formData.user_id,
            ethereum_address:formData.ethereum_address
        }

        let profileDate = null;
        Profile.where(updateBy, updatehById).fetch().then((user) => {
            if (user) {
                return user.save(_.omit(profile_data, 'user_id'), { patch: true });
            } else {
                return new Profile(profile_data).save();
            }
        }).then((profile) => {
            profileDate = profile;
            return new User().getAuthorizeToken(formData.user_id);
        })
            .then((responseData) => {
                let updatedProfileData = _.assignIn(profileDate.toJSON(), responseData);
                return res.status(200).json(res.fnSuccess(updatedProfileData));
            })
            .catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
    },

    destroy: function (req, res, next) {

        let destroyByParams = [
            'user_id', 'id'
        ];

        let destroyBy = req.query.destroy_by ? (destroyByParams.indexOf(req.query.destroy_by) >= 0 ? req.query.destroy_by : 'id') : 'id';
        let destroyById = req.params.id;

        Profile.where(destroyBy, destroyById).destroy({ required: false }).then((profile) => {
            return res.status(200).json(res.fnSuccess(profile));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = ProfileController;