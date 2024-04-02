const CourseDiscussionsResponse = Model('Course/CourseDiscussionsResponse');
const Validator = Helper('validator');
const Profile  = Model('Profile');
const notificationAlert = Helper('notification-alert');

const CourseDiscussionsResponseController = {

    index: function (req, res, next) {

        let relationShip = [];
        let has_pagination = _.toBoolean(req.query.pagination);
        let limit = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;
        let courseDiscussions = _.toBoolean(req.query.course_discussion);
        let userId = _.toInteger(req.query.user_id);
        let courseDiscussionId = _.toInteger(req.query.course_discussions_id);       

        let courseDiscussionsResponse = CourseDiscussionsResponse.forge().orderBy('-id');

        if(userId){
           // courseDiscussionsResponse = courseDiscussionsResponse.where('user_id',userId);
            courseDiscussionsResponse = courseDiscussionsResponse.where('course_discussions_id',courseDiscussionId);
        }

        if(courseDiscussionId){
            courseDiscussionsResponse = courseDiscussionsResponse.where('course_discussions_id',courseDiscussionId);
        }

        if (courseDiscussions) {
            relationShip.push('course_discussions');
        }
        relationShip.push('user'); 
        relationShip.push('user.profile')
        if (has_pagination) {
            let relation_params = Object.assign(
                { pageSize: limit, page: page }
            );
            courseDiscussionsResponse = courseDiscussionsResponse.fetchPage(relation_params);
        }
        else {
            courseDiscussionsResponse = courseDiscussionsResponse
                .fetchAll(Object.assign(
                    { withRelated: relationShip }
                )
            );
        }

        courseDiscussionsResponse.then((response) => {
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function (req, res, next) {

        let formData = req.body;
        let validation = new Validator(formData, {
            user_id: 'required|integer|inDatabase:users,id',
            course_discussions_id: 'required|integer|inDatabase:course_discussions,id',
            comments: 'required|string'
        });

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        if(await Profile.where('user_id',formData.user_id).count() === 0){
            return res.status(400).json(res.fnError('Please complete your profile before post your  question.'));
        }

        let discussion_response = _.pickBy({
            user_id: formData.user_id,
            course_discussions_id: formData.course_discussions_id,
            comments: formData.comments
        }, _.identity)

        new CourseDiscussionsResponse(discussion_response).save().then((discussion) => {

            notificationAlert.courseDiscussionAlert(discussion_response,'customer',discussion.id);
            return res.status(200).json(res.fnSuccess(discussion));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },

    show: function (req, res, next) {
        let discussion_response_id = req.params.id;

        CourseDiscussionsResponse.where('id', discussion_response_id).fetch().then((discussion) => {
            return res.status(200).json(res.fnSuccess(discussion));
        }).catch((errors) => {
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function (req, res, next) {

        let discussion_response_id = req.params.id;
        let formData = req.body;
        let validationRules = {
            user_id: 'required|integer|inDatabase:users,id',
            course_discussions_id: 'required|integer|inDatabase:course_discussions,id',
            comments: 'required|string'
        }

        let validation = new Validator(formData, validationRules);

        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let discussion_response_data = _.pickBy({
            user_id: formData.user_id,
            course_discussions_id: formData.course_discussions_id,
            comments: formData.comments
        }, _.identity);

        CourseDiscussionsResponse.where('id', discussion_response_id)
            .save(discussion_response_data, { patch: true })
            .then((discussion) => {
                return res.status(200).json(res.fnSuccess(discussion));
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
    },

    destroy: function (req, res, next) {
        let discussion_response_id = req.params.id;

        CourseDiscussionsResponse.where('id', discussion_response_id)
            .destroy({ required: false })
            .then((response) => {
                return res.status(200).json(res.fnSuccess(response));
            }).catch((errors) => {
                return res.status(400).json(res.fnError(errors));
            });
    },
}

module.exports = CourseDiscussionsResponseController;