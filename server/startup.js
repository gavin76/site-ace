
Meteor.startup(function () {
// code to run on server at startup

if (!Websites.findOne()){
	console.log("No websites yet. Creating starter data.");
	  Websites.insert({
		title:"Goldsmiths Computing Department", 
		url:"http://www.gold.ac.uk/computing/", 
		description:"This is where this course was developed.",
		score: 3,
		upvotes: 3,
		downvotes: 0,
		createdOn:new Date(),
		comments: [{
					comment: "Great teachers!",
					author: "John",
					createdOn: new Date()
					},
					{
					comment: "Interesting courses",
					author: "Jade",
					createdOn: new Date()
					}]
	});
	 Websites.insert({
		title:"University of London", 
		url:"http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route", 
		description:"University of London International Programme.", 
		score: 3,
		upvotes: 4,
		downvotes: 1,
		createdOn:new Date(),
		comments: []
	});
	 Websites.insert({
		title:"Coursera", 
		url:"http://www.coursera.org", 
		description:"Universal access to the world’s best education.", 
		score: 2,
		upvotes: 5,
		downvotes: 2,
		createdOn:new Date(),
		comments: []
	});
	Websites.insert({
		title:"Google", 
		url:"http://www.google.com", 
		description:"Popular search engine.", 
		score: 3,
		upvotes: 6,
		downvotes: 3,
		createdOn:new Date(),
		comments: []
	});
}

});

Meteor.methods({
    
    "remoteGet": function(url, options) {
        return HTTP.get(url, options);
    }
    /*
	getUrlInfo: function(url) {
		this.unblock;
		console.log("Attempting to get info from url: " + url);
        
        HTTP.get(url, {headers: {Accept: '/'}}, function(err, response) {
            if (err) {
                console.log("Error: " + err);
                return err;
            }
            
                console.log("StatusCode: " + response.statusCode);
                console.log(response.content);
                return response.content;
                
        }); 
        
        try {
            var result = HTTP.get(url, {headers: {Accept: '/'}});
            var data = result.content;
            console.log(data);
            return(data);
        } catch (err) {
            console.log("Cannot get page from URL: " + err);
        }
	} */
});

