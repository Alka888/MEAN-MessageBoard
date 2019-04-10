var express = require('express');
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');

app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request

var session = require('express-session');
app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

//////////////MONGOOSE///////////

var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/dashboard');

var CommentSchema = new mongoose.Schema({
    cname: {type: String, required: true, minlength: 3},
    ccomment: {type: String, required: true, minlength: 3},
  }, {timestamps: true})



var MesSchema = new mongoose.Schema({
	name:  { type: String, required: true, minlength: 3},
	message:  { type: String, required: true, minlength: 5},
	comments: [CommentSchema]
}, {timestamps: true });

mongoose.model('message', MesSchema);
mongoose.model('comment', CommentSchema);
// Retrieve the Schema called 'User' and store it to the variable User

var Comment = mongoose.model('comment');
var Message = mongoose.model('message');

mongoose.Promise = global.Promise;

var flash = require('express-flash');
app.use(flash());


/////////////rendering home page//////////////

app.get('/', function (req, res){
	// This is where we will retrieve the quotes from the database and include them in the view page we will be rendering.
	
		Message.find({}, function(err, allmessages){
			console.log(allmessages);
			if(err){
				console.log(err)
				res.render('index', {err})
			}else{
			res.render('index', {'allmessages': allmessages});
			}
		})
	});


///////////////method to add message/////////////

app.post('/message', function (req, res) {
	console.log("POST DATA", req.body);
	var message = new Message({ name: req.body.name, message: req.body.message });
	message.save(function (err) {
		if (err) {
			// if there is an error upon saving, use console.log to see what is in the err object 
			console.log("We have an error!", err);
			// adjust the code below as needed to create a flash message with the tag and content you would like
			for (var key in err.errors) {
				req.flash('registration', err.errors[key].message);
			}
			// redirect the user to an appropriate route
			res.redirect('/');
		}
		else {
			res.redirect('/');
		}
	});
})


app.post('/comment/:id', function (req, res) {
	console.log("POST DATA", req.body);
	var newcomment = new Comment({ cname: req.body.cname, ccomment: req.body.ccomment });
	newcomment.save(function (err) {
		if (err) {
			// if there is an error upon saving, use console.log to see what is in the err object 
			console.log("We have an error!", err);
			// adjust the code below as needed to create a flash message with the tag and content you would like
			for (var key in err.errors) {
				req.flash('addmess', err.errors[key].message);
			}
			// redirect the user to an appropriate route
			res.redirect('/');
		}
		else {
				console.log("/////////////////////////////////");
				Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: newcomment}}, function(err, data){
					if(err){
						console.log("We have an error!", err);
					}
					else {
						console.log(newcomment);
						res.redirect('/');
					}
				});
			
		}
	});
})

app.listen(8000, function() {
    console.log("listening on port 8000");
})

