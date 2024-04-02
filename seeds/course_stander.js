const course_stander = [
	{id:'1', title:'High'},
	{id:'2', title:'Medium'},
	{id:'3', title:'Moderate'},
	{id:'4', title:'Low'},
]
exports.seed = function(knex, Promise) {
  	return knex('course_standers').del().then(function () {
      	return knex('course_standers').insert(course_stander);
    });
};
