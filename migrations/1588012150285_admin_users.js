exports.up = async function(knex) {
    await knex.raw("INSERT INTO `c_user` (`ID`, `EMAIL`,`ALIAS` ,`LAST_NAME`,`PASSWORD`, `NAME`, `ROLE`, `COUNTRY_CODE`, `MOBILE`, `CREATED_AT`, `UPDATED_AT`) VALUES ('qweredsxcd', 'admin@pactnuel.com','admin@pactnuel','admin', MD5('admin'), 'Admin', '{\\\"ROLES\\\":[\\\"admin\\\"]}', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);",
    );
};

exports.down = async function(knex) {
    await knex.raw("DELETE FROM `c_user` WHERE `c_user`.`ID` = \\'qweredsxcd\\'");
};
