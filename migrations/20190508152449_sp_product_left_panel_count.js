const spName = 'sp_product_left_panel_count';
const spCredentials = '`matkol2061`@`%`';
const storedProcedureProductLeftPanel = 
`CREATE DEFINER=${spCredentials} PROCEDURE ${spName}(
	IN param VARCHAR(150)
)
BEGIN

IF param = 'events' THEN  #fetch all category with event count 

	SELECT categories . * , (
		SELECT COUNT( category_product.category_id ) 
		FROM category_product
		LEFT JOIN products ON products.id = category_product.product_id
		LEFT JOIN product_events ON product_events.product_id = products.id
		WHERE category_product.category_id = categories.id
		AND products.product_type =  "event_ticket"
		AND products.status =  "publish"
		AND products.is_delete =0
		AND products.is_active =1
	) AS product_count
	FROM categories
	WHERE categories.is_active =1
	and categories.type = 'courses'
    ORDER BY categories.id DESC; 
    
ELSEIF param = 'courses' THEN #fetch all category with courses count

	SELECT categories. * , (
        SELECT COUNT( category_course.category_id ) 
        FROM category_course
        LEFT JOIN courses ON courses.id = category_course.course_id
        WHERE category_course.category_id = categories.id
        AND courses.status =  "publish"
        AND courses.is_delete =0
        AND courses.is_active =1
    ) AS product_count
    FROM categories
	WHERE categories.is_active =1
	and categories.type = 'courses'
    ORDER BY categories.id DESC;

ELSEIF param = 'countries' THEN  #fetch all country with event count

	SELECT countries . * , (
		SELECT COUNT( product_events.country_id ) 
		FROM product_events
		LEFT JOIN products ON products.id = product_events.product_id
		WHERE product_events.country_id = countries.id
		AND products.status =  'publish'
		AND products.is_active =1
		AND products.is_delete =0
		) AS product_count
	FROM  countries 
	ORDER BY countries.name ASC;
    
ELSEIF param = 'event_speakers' THEN #fetch all event speaker with event count

	SELECT event_speakers . * , (
		SELECT COUNT( category_product_speakers.product_id ) 
		FROM category_product_speakers
		LEFT JOIN products ON products.id = category_product_speakers.product_id
		LEFT JOIN product_events ON product_events.product_id = products.id
		WHERE category_product_speakers.event_speaker_id = event_speakers.id
		AND products.product_type =  "event_ticket"
		AND products.status =  "publish"
		AND products.is_delete =0
		AND products.is_active =1
		) AS product_count
	FROM  event_speakers
	WHERE event_speakers.is_active =1
	ORDER BY event_speakers.name ASC;
    
END IF;    
END`;

exports.up = function(knex, Promise) {
    return knex.raw(storedProcedureProductLeftPanel)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP PROCEDURE IF EXISTS ${spName}`);
};
