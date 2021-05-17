exports.up = async function(knex) {
  await knex.raw("alter table c_blog add TOP char default 0 null;");
  await knex.raw("alter table c_blog add FEATURED char default 0 null;");
};

exports.down = async function(knex) {
  await knex.raw("select * from c_blog");
};
