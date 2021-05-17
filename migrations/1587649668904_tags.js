exports.up = async function(knex) {
  await knex.raw("create table if not exists c_tags\n" +
  "(\n" +
  "\tID varchar(20) not null\n" +
  "\t\tprimary key,\n" +
  "\tNAME varchar(80) not null,\n" +
  "\tSTATUS varchar(40) default 'active' null,\n" +
  "\tCREATED_AT timestamp default CURRENT_TIMESTAMP NOT NULL,\n" +
  "\tUPDATED_AT timestamp default CURRENT_TIMESTAMP null\n" +
  ");\n" +
  "\n");
};

exports.down = async function(knex) {
  await knex.raw("drop table c_tags;");
};
