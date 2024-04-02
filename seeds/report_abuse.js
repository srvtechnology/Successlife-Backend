const report_abuse = [
	{id:'1', title:'Reviews removed by the Automatic (Spam) Review Filter.'},
	{id:'2', title:'Negative reviews reported as policy abuse.'},
	{id:'3', title:'Reviews acquired improperly.'}
]
exports.seed = function(knex, Promise) {
  	return knex('report_abuses').del().then(function () {
      	return knex('report_abuses').insert(report_abuse);
    });
};
