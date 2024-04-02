const course_time = [
	{id:'1', name:'I’m very busy right now (0-2 hours)'},
	{id:'2', name:'I’ll work on this on the side (2-4 hours)'},
	{id:'3', name:'I have lots of flexibility (5+ hours)'},
	{id:'4', name:'I haven’t yet decided if I have time'},
]
exports.seed = function(knex, Promise) {
  	return knex('course_times').del().then(function () {
      	return knex('course_times').insert(course_time);
    });
};
