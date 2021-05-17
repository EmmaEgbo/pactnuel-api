exports.up = async function(knex) {
  await knex.raw("alter table c_user add EMAIL_VERIFY char default 0 null;");
  await knex.raw("alter table c_user add REMEMBER_TOKEN varchar(255) null;");
};

exports.down = async function(knex) {
  await knex.raw("select * from c_user");
};
