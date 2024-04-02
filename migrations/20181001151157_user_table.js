
exports.up = function(knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments();
        table.string('user_name').unique();
        table.string('password').nullable();
        table.string('avatar').nullable();
        table.string('phone_code').nullable();
        table.string('mobile_no').nullable();
        table.string('token').nullable().comment('activation token');;
        table.boolean('is_active').defaultTo(false).comment('is active by activation token');
        table.boolean('is_block').defaultTo(false).comment('is block by superuser');
        table.boolean('is_login').defaultTo(false).comment('is user authinticated');
        table.boolean('is_kyc').defaultTo(false);
        table.text('agreement_pdf').nullable();
        table.boolean('in_agreement').defaultTo(false);
        table.timestamp('deleted_at').nullable();
        table.timestamp('activated_at').nullable();
        table.timestamp('notify_view_date').nullable();
        table.timestamps();
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
