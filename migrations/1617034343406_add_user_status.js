exports.up = async function(knex) {
  await knex.raw("alter table c_user add STATUS char default 1 null;");
};

exports.down = async function(knex) {
  await knex.raw("select * from c_user");
};
