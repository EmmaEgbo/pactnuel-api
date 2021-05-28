module.exports = {
  "up": function (conn, cb) {
    conn.query ("alter table c_user add EMAIL_VERIFY char default 0 null;", function (err, res) {
      conn.query ("alter table c_user add REMEMBER_TOKEN varchar(255) null;", function (err, res) {
        cb();
      });
    });},
  "down": "select * from c_user"
};