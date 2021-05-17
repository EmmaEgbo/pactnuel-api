exports.up = async function(knex) {
  await knex.raw("CREATE TABLE `c_file` ( `ID` VARCHAR(20) NOT NULL , `PATH` VARCHAR(128) NOT NULL , `MIME_TYPE` VARCHAR(10) NOT NULL , PRIMARY KEY (`ID`)) ENGINE = InnoDB;");
};

exports.down = async function(knex) {
  await knex.raw("DROP TABLE `c_file`;");
};
