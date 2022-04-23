//这是设置代理
const {
  createProxyMiddleware
} = require('http-proxy-middleware');

module.exports = app => {
  app.use(createProxyMiddleware('/api',{
    target: 'http://127.0.0.1:5004',
    secure: false,
    pathRewrite: {
      '^/api': '/', // remove base path
    },
    changeOrigin: true
  }));
};
