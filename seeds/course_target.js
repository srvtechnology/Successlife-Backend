const course_target = [
	{id:'1', question:'What will students learn in your course?'},
	{id:'2', question:'Are there any course requirements or prerequisites?'},
	{id:'3', question:'Who are your target students?'}
]
exports.seed = function(knex, Promise) {
  	return knex('course_targets').del().then(function () {
      	return knex('course_targets').insert(course_target);
    });
};
