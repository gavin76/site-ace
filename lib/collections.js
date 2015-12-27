// Site Ace Website Collection
Websites = new Mongo.Collection("websites");

// Set up security of Website collection
Websites.allow({

	// Update websites for votes.
	update: function(userId, doc) {
		console.log("Testing security on website update");
		if (Meteor.user()) {
			return true;
		} else {
			return false;
		}
	},

	insert: function(userId, doc) {
		console.log("Testing security on website insert");
		if (Meteor.user()) {
			return true;
		}
		else {
			return false;
		}

	},

	remove: function(userId, doc) {
        console.log("Testing security on website remove");
		if (Meteor.user()) {
			return true;
		}
		else {
			return false;
		}
	}
});