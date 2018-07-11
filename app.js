const express = require('express');
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

//Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

//Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

//Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Method override middleware
app.use(methodOverride('_method'));

//Express session middleware
app.use(session({
  secret: 'secrett',
  resave: true,
  saveUninitialized: true
}));

//Connect flash middleware
app.use(flash());

//Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');

  next();
});

//Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title
  });
});

//About Route
app.get('/about', (req, res) => {
  res.render('about');
});

//Idea Index Page
app.get('/ideas', (req, res) => {
  Idea.find({})
  .sort({date:'desc'})
  .then(ideas => {
    res.render('ideas/index', {
      ideas
    });
  });
});

//Add Idea Form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

//Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    console.log(idea);
    res.render('ideas/edit', {
      idea
    });
  });
});

//Process Form
app.post('/ideas', (req, res) => {
  // console.log(releaseEvents.body);
  let errors = [];

  if (!req.body.title) {
    errors.push({text: 'Pease add a tittle'});
  }

  if (!req.body.details) {
    errors.push({text: 'Pease add some details'});
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Idea(newUser)
    .save()
    .then(idea => {
      req.flash('success_msg', 'Video Idea added');
      res.redirect('/ideas')
    });
  }
});

//Edit Form process
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      //new values
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Video Idea updated');
          res.redirect('/ideas');
        });
    });
});

//Delete idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Video Idea removed');
      res.redirect('/ideas');
    });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})