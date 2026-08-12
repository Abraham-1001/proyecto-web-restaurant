module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant',
  jwtSecret: process.env.JWT_SECRET || 'secreto_super_seguro_jwt',
};