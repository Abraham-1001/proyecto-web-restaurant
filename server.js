const { app, port } = require('./src/app');
const conexion = require('./src/config/conexion');

conexion.connect()

app.listen(port, () => {
  console.log(`El servidor esta corriendo en el puerto: http://localhost:${port}`);
});