const viewName = 'vw_product_autocomplete_search';
const autoCompleteSearch = `
CREATE VIEW ${viewName} AS
select 
products.id as id,
products.title as search_name,
products.id as enitity_id,
'products' as enitity_type,
products.created_at as created_at
FROM products
where products.status = 'publish'
UNION 
SELECT 
users.id as id,
CONCAT(COALESCE(profiles.first_name,''),'' ,COALESCE(profiles.middle_name,''),' ',COALESCE(profiles.last_name,'')) as search_name,
profiles.id as enitity_id,
'profile' as enitity_type,
users.created_at as created_at
FROM users
INNER JOIN profiles ON profiles.user_id = users.id
LEFT JOIN role_user ON role_user.user_id = users.id
where users.is_active = 1 
and role_user.role_id = 4
and users.is_block = 0
UNION
select 
categories.id as id,
categories.name as search_name,
categories.id as enitity_id,
'categories' as enitity_type,
categories.created_at as created_at
FROM categories
where categories.is_active = 1 
UNION 
select 
courses.id as id,
courses.title as search_name,
courses.id as enitity_id,
'courses' as enitity_type,
courses.created_at as created_at
FROM courses
where courses.status = 'publish'
and courses.is_active = 1
and courses.is_delete = 0`;

exports.up = function(knex, Promise) {
    return knex.raw(autoCompleteSearch)
};

exports.down = function(knex, Promise) {
    return knex.raw(`DROP VIEW IF EXISTS ${viewName}`);
};
 