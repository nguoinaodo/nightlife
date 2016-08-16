'use strict';

var Controller = require(process.cwd() + '/app/controllers/controller.server.js');

module.exports = function(app, passport) {
	var controller = new Controller();
	
	app.route('/')
		.get(function(req, res) {
			var auth = req.isAuthenticated();
			
			res.render('home', {
				auth: auth,
				displayName: auth? req.user.github.displayName: ''
			});
		});	
	
	app.route('/api/search/:textSearch')
		.get(controller.search);
	
	app.route('/api/lastsearch')
		.get(controller.lastSearch);
	
	
	
	app.route('/api/go/:placeId')
		.get(controller.getGoing)
		.post(controller.go)
		.delete(controller.ungo);
	
	app.route('/api/image/:reference')
		.get(controller.getImage);
		
	
	
	// auth
	app.route('/auth/github')
		.get(passport.authenticate('github'));
	
	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
	
	app.route('/logout')
		.get(function(req, res) {
			req.logout();
			res.redirect('/');
		});
};
