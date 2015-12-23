// main.js file for SiteAce

/// Routing

Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function() {
	this.render('navbar', {
		to: "navbar"
	});
	this.render('home', {
		to: "main"
	});
});

Router.route('/site/:_id', function() {
	this.render('navbar', {
		to: "navbar"
	});
	this.render('site', {
		to: "main",
		data: function() {
			return Websites.findOne({_id:this.params._id});
		}
	});
});
/// Accounts config

Accounts.ui.config({
	passwordSignupFields: "USERNAME_AND_EMAIL"
});


/// Template Helpers

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
		return Websites.find({}, {sort:{score: -1, createdOn: -1}});
	}
});


/////
// template events 
/////

Template.website_item.events({
	"click .js-upvote":function(event){
		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		var website_id = this._id,
			newupvotes = this.upvotes + 1,
			newscore = this.score + 1;
		
		console.log("Up voting website with id "+website_id);
		// put the code in here to add a vote to a website!
		Websites.update({_id: website_id},
						{$set: {upvotes: newupvotes,
								score: newscore}})
		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){

		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		var website_id = this._id,
			newdownvotes = this.downvotes + 1,
			newscore = this.score - 1;

		console.log("Down voting website with id "+website_id);

		// put the code in here to remove a vote from a website!
		Websites.update({_id: website_id},
						{$set: {downvotes: newdownvotes,
								score: newscore}})
		return false;// prevent the button from reloading the page
	},
	"click .js-details":function(event) {
		$(event.target).css("width", "50px");
		console.log(event);
		console.log(event.target);
    	console.log("Clicked details button");
	}
})

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	}, 
	"submit .js-save-website-form":function(event){

		// here is an example of how to get the url out of the form:
		var web_url = event.target.url.value;
		if (!isValidUrl(web_url)) {
			console.log("Not a valid URL");
			alert("Please enter a valid URL");
			return false;
		}

		console.log("The url they entered is: "+url);
		var web_title = event.target.title.value;
		console.log("The title is: " + web_title);
		var web_desc = event.target.description.value;
		console.log("The description is: " + web_desc);

		if (Meteor.user()) {
			Websites.insert({
				title: web_title, 
				url: web_url, 
				description:web_desc,
				votes: 0, 
				createdOn:new Date()
			});
		}
		
		// Reset form
		$("#url").val("");
		$("#title").val("");
		$("#description").val("");
		$("#website_form").toggle('slow');

		return false;// stop the form submit from reloading the page

	}
});

function isValidUrl(url) {

	var myVariable = url;
	if (/^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(myVariable)) {
	  return true;
	} else {
	  return false;
	}   
}

