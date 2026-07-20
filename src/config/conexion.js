const mongoose = require('mongoose');
const { db } = require('./config');

module.exports = {
    connection : null,
    connect : function() {
        if (this.connection) return this.connection;
        return mongoose.connect(db, {
        }).then((conexion) => {
            this.connection = conexion;
            console.log('Conexión a la base de datos establecida');
            }).catch((error) => console.log(error));
    }
}