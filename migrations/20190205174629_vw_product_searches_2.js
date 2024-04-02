const viewName = 'vw_product_searches_2';
const productSearchView2 = `
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
    products.product_type as product_type,
	0 as duration,
	0 as stander_id,
    0 as stander_name,
	0 as lecture_count,
    0 as usd_price,
    0 as sxl_price,
    GROUP_CONCAT( categories.name ) AS category_name, 
    GROUP_CONCAT( categories.id ) AS category_id,
    GROUP_CONCAT( event_speakers.name ) AS speaker_name,
    GROUP_CONCAT( event_speakers.id ) AS speaker_id,
	(SELECT CONCAT(COALESCE(profiles.first_name,''),'' ,COALESCE(profiles.middle_name,''),' ',COALESCE(profiles.last_name,'') ) FROM profiles WHERE profiles.user_id = products.user_id) AS user_full_name,
    (SELECT thumbnail FROM images WHERE images.imagable_type = 'products' AND images.imagable_id = products.id group by products.id) as image,
	products.user_id as user_id,
	products.created_at as created_at

FROM products
LEFT JOIN category_product ON category_product.product_id = products.id
LEFT JOIN categories ON categories.id = category_product.category_id

LEFT JOIN category_product_speakers ON category_product_speakers.product_id = products.id
LEFT JOIN event_speakers ON event_speakers.id = category_product_speakers.event_speaker_id

WHERE products.status = 'publish'
group by products.id

UNION 

SELECT 
	courses.id as id,
	courses.id as enitity_id,
	'courses' as enitity_type,
	courses.title as title,
	courses.slug as slug,
	courses.sub_title as sub_title,
	courses.description as description,
	courses.rating as rating,	
	'courses' as product_type,
	courses.duration as duration,
	courses.course_stander_id as stander_id,
	course_standers.title as stander_name,   
	
	(SELECT COUNT(id) FROM course_lectures WHERE course_module_id in (
		SELECT id from course_modules WHERE course_id in (courses.id)
	)) as lecture_count,    
	
	(SELECT GROUP_CONCAT(product_prices.usd_price) FROM product_prices where product_prices.pricable_id = courses.id and product_prices.pricable_type = 'courses' ) as usd_price,

	(SELECT GROUP_CONCAT(product_prices.sxl_price) FROM product_prices where product_prices.pricable_id = courses.id and product_prices.pricable_type = 'courses' ) as sxl_price,

	GROUP_CONCAT( categories.name ) AS category_name, 
    GROUP_CONCAT( categories.id ) AS category_id,
	
	null as speaker_name,
	null as speaker_id,


	(SELECT CONCAT(COALESCE(profiles.first_name,''),'' ,COALESCE(profiles.middle_name,''),' ',COALESCE(profiles.last_name,'') ) FROM profiles WHERE profiles.user_id = courses.created_by) as user_full_name,
	(SELECT thumbnail FROM images WHERE images.imagable_type = 'courses' AND images.imagable_id = courses.id group by courses.id) as image,
	courses.created_by as user_id,
	courses.created_at as created_at
	
    
FROM courses
LEFT JOIN category_course ON category_course.course_id = courses.id
LEFT JOIN categories ON categories.id = category_course.category_id
LEFT JOIN course_standers ON course_standers.id = courses.course_stander_id
WHERE courses.status = 'publish'
and courses.is_active = 1
and courses.is_delete = 0
group by courses.id`;


exports.up = function(knex, Promise) {
    return knex.raw(productSearchView2)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP VIEW IF EXISTS ${viewName}`);
};
 