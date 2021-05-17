exports.up = async function(knex) {
  await knex.raw("create table if not exists c_category\n" +
  "(\n" +
  "\tID varchar(20) not null\n" +
  "\t\tprimary key,\n" +
  "\tNAME varchar(80) not null,\n" +
  "\tDESCRIPTION text not null,\n" +
  "\tIMAGE_ID varchar(20) not null,\n" +
  "\tSTATUS varchar(40) default 'submitted' null,\n" +
  "\tCREATED_AT timestamp default CURRENT_TIMESTAMP NOT NULL,\n" +
  "\tUSED_IN JSON null,\n" +
  "\tUPDATED_AT timestamp default CURRENT_TIMESTAMP null,\n" +
  "\tconstraint c_category_c_file_ID_fk\n" +
  "\t\tforeign key (IMAGE_ID) references c_file (ID)\n" +
  ");\n" +
  "\n");
};

exports.down = async function(knex) {
  await knex.raw("drop table c_category;");
};
