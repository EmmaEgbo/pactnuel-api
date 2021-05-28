module.exports = {
  "up": function (conn, cb) {
    conn.query ("alter table c_user add STATUS char default 1 null;", function (err, res) {
        cb();
    });},
  "down": "select * from c_user"
};