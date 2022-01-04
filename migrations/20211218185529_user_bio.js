
exports.up = async function(knex) {
    await knex.raw("ALTER TABLE c_user ADD BIO VARCHAR(256) default 'Hey there! I am on Pactnuel. I read and sometimes, I write. This is my short bio!';");
};

exports.down = async function(knex) {
    await knex.raw("ALTER TABLE c_user DROP COLUMN BIO;");
};
