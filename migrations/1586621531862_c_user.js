exports.up = async function(knex) {
    await knex.raw("CREATE TABLE `c_user` ( `ID` VARCHAR(20) NOT NULL , `EMAIL` VARCHAR(128) NOT NULL,`PASSWORD` VARCHAR(128) NOT NULL, `NAME` VARCHAR(128) NOT NULL ,`ROLE` JSON NOT NULL, `COUNTRY_CODE` VARCHAR(10) NULL , `MOBILE` VARCHAR(20) NULL ,`CREATED_AT` timestamp default CURRENT_TIMESTAMP,`UPDATED_AT` timestamp default CURRENT_TIMESTAMP, PRIMARY KEY (`ID`), UNIQUE (`MOBILE`), UNIQUE (`EMAIL`)) ENGINE = InnoDB;",
    );
};

exports.down = async function(knex) {
    await knex.raw("DROP TABLE `c_user`;");
};
