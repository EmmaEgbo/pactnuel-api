module.exports = {
  "up": function (conn, cb) {
    conn.query ("alter table c_user add IMAGE VARCHAR(256) default null;", function (err, res) {
      cb();
    });},
  "down": "select * from c_user"
};