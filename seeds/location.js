
exports.seed = function(knex, Promise) {

	return knex.raw('SET foreign_key_checks = 0;').then(()=>{
		return knex('countries').del().then(function () {
			return knex('countries').insert(require('./data/countries'));
		})
	}).then(()=>{
		return knex('states').del().then(function () {
			return knex('states').insert(require('./data/states'));
		})
	}).then(()=>{
		return knex('cities').del().then(function () {
			return knex('cities').insert(require('./data/cities'));
		})
	}).finally(()=>{
		knex.raw('SET foreign_key_checks = 1;') 
	})
};

