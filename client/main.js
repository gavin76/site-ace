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

Template.home.helpers({
    isLoggedIn: function() {
        if (Meteor.user()) {
            return true;
        } else {
            return false;
        }
    },
    username: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        } else {
            return "Anon";
        }
    }
});

// helper function that returns all available websites
Template.website_list.helpers({
	websites:function(){
        var findParam = Session.get("listingFind");
		return Websites.find(findParam, {sort:{upvotes: -1, score: -1}});
	}
});

Template.website_item.helpers({
    numcomments: function() {
        var website_id = this._id;
		var comments = Websites.findOne({_id: website_id}).comments;
		console.log(comments.length);
		return (comments.length);
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
            
            // Check for URL
			var web_url = event.target.websiteurl.value;
			if (!isValidUrl(web_url)) {
				console.log("Not a valid URL");
				alert("Please enter a valid URL");
				return false;
			}
			console.log("The url they entered is: " + web_url);
            
            // Check if title and description entered
            // If not, to try get from URL
            // If so, to insert directly into database
            
            var web_title = event.target.title.value;
			console.log("The title is: " + web_title);
			var web_desc = event.target.description.value;
			console.log("The description is: " + web_desc);

            if (web_title === '' || web_desc === '') {
                Meteor.call("remoteGet", web_url, {}, function(error, response) {
                    console.log("Attempt get URL");
                    if (error) {
                        console.log("Error: " + error);
                    } else {
                        console.log(response.content);
                        if (web_title === '') {
                            web_title = $(response.content).filter('title').text();
                            if (web_title === undefined) {
                                web_title = prompt("No title available from website. Please enter a title");
                            }
                            if (web_title === "") {
                                web_title = "Untitled";
                            }
                            console.log("Title set: " + web_title);
                        }
                        if (web_desc === '') {
                            web_desc = $(response.content).filter('meta[name="description"]').attr("content");
                            if (web_desc === undefined) {
                                web_desc = prompt("No description available from website. Please enter a description");
                            }
                            if (web_desc === "") {
                                web_desc = "No description available";
                            }
                            console.log("Description set: " + web_desc);
                        }
                        insertWebsite(web_url, web_title, web_desc);
                    }
                });
                
            } else {
                insertWebsite(web_url, web_title, web_desc);
            } 
		}

		return false;// stop the form submit from reloading the page

	}
});

Template.search_box.events({
    "keyup #searchbox" : function(event) {
        var search_text = $("#searchbox").val();
        Session.set("listingFind", {$or: [{"title": { $regex: search_text, $options: "i" }},
                                         {"description": { $regex: search_text, $options: "i"}}]});
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

function insertWebsite(url, wtitle, wdesc) {
     Websites.insert({
                title: wtitle, 
                url: url, 
                description: wdesc,
                score: 0, 
                upvotes: 0,
                downvotes: 0,
                createdOn:new Date(),
                comments: []
            });
    console.log("Inserted website");
    // Reset form
    $("#websiteurl").val("");
    $("#title").val("");
    $("#description").val("");
    $("#website_form").toggle('slow');
            
}