const viewName = 'vw_product_searches';
const productSearchView = `
CREATE VIEW ${viewName} AS
SELECT 
	products.id as id,
	products.id as enitity_id,
	'products' as enitity_type,
	products.title as title,
	products.slug as slug,
	products.short_description as sub_title,
	products.description as description,
	products.rating as rating,
	products.price as price,
	0 as duration,
	0 as stander_id,
	0 as lecture_count,
	(SELECT CONCAT( profiles.first_name, profiles.middle_name, profiles.last_name ) FROM profiles WHERE profiles.user_id = products.user_id) AS user_full_name,
	(SELECT thumbnail FROM images WHERE images.imagable_type = 'products' AND images.imagable_id = products.id) as image,
	products.user_id as user_id,
	products.created_at as created_at
FROM products
WHERE products.status = 'publish'
UNION ALL
SELECT 
	courses.id as id,
	courses.id as enitity_id,
	'courses' as enitity_type,
	courses.title as title,
	courses.slug as slug,
	courses.sub_title as sub_title,
	courses.description as description,
	courses.rating as rating,
	courses.price as price,
	courses.duration as duration,
	courses.course_stander_id as stander_id,
	(SELECT COUNT(id) FROM course_lectures WHERE course_module_id in (
		SELECT id from course_modules WHERE course_id in (courses.id)
	)) as lecture_count,
	(SELECT CONCAT( profiles.first_name, profiles.middle_name, profiles.last_name ) FROM profiles WHERE profiles.user_id = courses.created_by) as user_full_name,
	(SELECT thumbnail FROM images WHERE images.imagable_type = 'courses' AND images.imagable_id = courses.id) as image,
	courses.created_by as user_id,
	courses.created_at as created_at
FROM courses
WHERE courses.status = 'publish'`;


exports.up = function(knex, Promise) {
    return knex.raw(productSearchView)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP VIEW IF EXISTS ${viewName}`);
};



