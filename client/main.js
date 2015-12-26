// main.js file for SiteAce
Session.set("listingFind", {});
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
        var findParam = Session.get("listingFind");
		return Websites.find(findParam, {sort:{score: -1, createdOn: -1}});
	}
});

Template.comment_list.helpers({
	comments: function() {
		var website_id = this._id;
		return Websites.findOne({_id: website_id}).comments;
	},
	hasComments: function() {
		var website_id = this._id;
		var comments = Websites.findOne({_id: website_id}).comments;
		console.log(comments, comments.length);
		return (comments.length > 0);
	}
});

Template.registerHelper('formatDate', function(date) {
	var monthAbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return monthAbr[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
})

/////
// template events 
/////

Template.website_item.events({
	"click .js-upvote":function(event){
		if (Meteor.user()) {
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
		} else {
			console.log("Not a meteor user");
		}
		return false;// prevent the button from reloading the page
	}, 
	"click .js-downvote":function(event){

		// example of how you can access the id for the website in the database
		// (this is the data context for the template)
		if (Meteor.user()) {
			var website_id = this._id,
				newdownvotes = this.downvotes + 1,
				newscore = this.score - 1;

			console.log("Down voting website with id "+website_id);

			// put the code in here to remove a vote from a website!
			Websites.update({_id: website_id},
							{$set: {downvotes: newdownvotes,
									score: newscore}})
		} else {
			console.log("Not a meteor user");
		}
		return false;// prevent the button from reloading the page		
	}
})

Template.website_form.events({
	"click .js-toggle-website-form":function(event){
		$("#website_form").toggle('slow');
	}, 
	"submit .js-save-website-form":function(event){

		if (Meteor.user) {
			var web_url = event.target.websiteurl.value;
			if (!isValidUrl(web_url)) {
				console.log("Not a valid URL");
				alert("Please enter a valid URL");
				return false;
			}
			console.log("The url they entered is: " + web_url);
			Meteor.call("getUrlInfo", web_url, {}, function(err, result) {
				if (err) {
					console.log("Error: ", err);
				};
				console.log("Meta data: " + result);
			});

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
			$("#websiteurl").val("");
			$("#title").val("");
			$("#description").val("");
			$("#website_form").toggle('slow');
		}

		return false;// stop the form submit from reloading the page

	}
});

Template.search_box.events({
    "keyup #searchbox" : function(event) {
        if (event.which === 13) {
            var search_text = $("#searchbox").val();
            console.log(search_text);
            Session.set("listingFind", {$or: [{"title": { $regex: search_text, $options: "i" }},
                                             {"description": { $regex: search_text, $options: "i"}}]});
            console.log(Session.get("listingFind"));
        }
    },
    "click .js-search-reset" : function(event) {
        $("#searchbox").val("");
        Session.set("listingFind", {});
    }
});

Template.comment_form.events({
	"submit .js-save-comment-form": function(event){

		if (Meteor.user()) {
			var website_id = this._id;
			var commentobj = {};

			commentobj.comment = event.target.comment.value;
			commentobj.author = Meteor.user().username;
			commentobj.createdOn = new Date();
			
			if (commentobj.comment !== "") {
				Websites.update({_id: website_id},
								{$push: { comments: commentobj }});
		}
			console.log(commentobj);
			
		} else {
			var alertmsg = '<div class="alert alert-danger alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Please log in to add a comment</div>';
			console.log("Not a meteor user");
			$("#comment-alert").html(alertmsg);
			//
		}
		
		// Reset form
		$("#comment").val("");

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

