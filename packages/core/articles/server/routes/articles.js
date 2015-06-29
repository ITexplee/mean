'use strict';

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && !req.article.user._id.equals(req.user._id)) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

var hasPermissions = function(req, res, next) {

    var allowed = true;
    var permission;

    req.body.permissions.forEach(function(prm) {
        if (req.acl.user.allowed.indexOf(prm) === -1) {
            permission = prm;
            allowed = false
            return;
        };
    });

    if (!allowed) return res.status(500).send('User not allowed to assign ' + permission + ' permission.');
    next();
};

module.exports = function(Articles, app, auth) {
  
  var articles = require('../controllers/articles')(Articles);

  app.route('/api/articles')
    .get(articles.all)
    .post(auth.requiresLogin, hasPermissions, articles.create);
  app.route('/api/articles/:articleId')
    .get(auth.isMongoId, articles.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, hasPermissions, articles.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, articles.destroy);

  // Finish with setting up the articleId param
  app.param('articleId', articles.article);
};
