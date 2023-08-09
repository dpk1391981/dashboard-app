const { createProxyMiddleware } = require("http-proxy-middleware");
const apiProxy = createProxyMiddleware("/api/**", {
  target: "http://localhost:5000",
});

module.exports = function (app) {
  app.use(apiProxy);
};
