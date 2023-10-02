const express=require('express');
const mongoose = require('mongoose');
const User= require('./user');
const Role= require('./role');
const Member= require('./member');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Comm = require('./community');
const app = express();
app.use(express.json());

// sorry due to insufficient time i didnt properly organize these functions or hiding up the keys . there are few diversions in the functions of community and member entities

mongoose.connect('mongodb+srv://20pa1a05e7:20pa1a05e7@cluster0.tu5uzsv.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });


  const jwtSecret = 'h7LW*2%zK$RwQ@9D#sP6G!vF4TmY#1Bp'; // Replace with a strong secret just like chaii 🤤🤤

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization; // Assuming the token is in the "Authorization" header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify and decode the token
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // The decoded object contains user information
    req.user = decoded;

    next(); // Continue processing the request
  });
};

// checking if the person is an Community admin or not as only community admins could create communities.
const isAdmin = (req, res, next) => {
  const { role } = req.user;

  if (role !== 'Community Admin') {
    return res.status(403).json({ message: 'Access denied. You are not a Community Admin.' });
  }

  next();
};

// Signup endpoint
app.post('/v1/auth/signup', async (req, res) => {
    try {       
      const { name, email, password } = req.body;  
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
       // Create a new user
      const user = new User({      
        name,
        email,
        password: hashedPassword
      }); 
      const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '12h' });
      await user.save();
      res.status(201).json({ message:user, token:token });
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
// Signin endpoint
app.post('/v1/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;  
      // Find the user by email
      const user = await User.findOne({ email }); 
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      } 
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Authentication failed' });
      }    
      const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '12h' });
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error during signin:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/v1/auth/me', verifyToken, (req, res) => {
    // Access user information from the req.user object
    const { userId, email } = req.user;
  
    res.status(200).json({ userId, email });
  });


app.post('/v1/role/',verifyToken, async(req,res) => {
  try{
    const {name}=req.body;
    req.user.role=name;
    const role=new Role({
      name
    }); 
  await role.save();
  res.status(201).json({ message:role});
} catch (error) {
  console.error('Error during role:', error);
  res.status(500).json({ message: 'Internal server error' });
}
});

// Get all roles
app.get('/v1/role', verifyToken, async (req, res) => {
  try {
    // Fetch all roles from the database
    const roles = await Role.find({}, 'name'); // Assuming you have a 'name' field in your Role schema

    res.status(200).json({ roles });
  } catch (error) {
    console.error('Error while fetching roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/v1/community',verifyToken,async(req,res)=>{
  try{
    const owner=req.user.id;
    const {name,slug}=req.body;
    const community=new Comm({name,slug,owner});
    await community.save();
    res.status(200).json({ message: community});
  }catch(error){
    console.error('Error while adding communities:', error);
    res.status(500).json({ message: 'Internal server error' });

  }
})

app.get('/v1/community',verifyToken,async(req,res)=>{
  try {
    // Fetch all communities  from the database
    const coms = await Comm.find({}); 

    res.status(200).json({ coms });
  } catch (error) {
    console.error('Error while fetching community:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})


// Get community members by community ID
app.get('/v1/community/:id/members', verifyToken, async (req, res) => {
  try {
    const communityId = req.params.id; // here its working for the object_id of mongodb, not for the community id . 
                                    // use this 651a89041b02d8949c60485e as parameter to know its functionality its an object id of a community
    // Find the community by ID
    const community = await Comm.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }  

    // Fetch members of the community
    const members = await User.find({ _id: { $in: community.members } });

    res.status(200).json({ members });
  } catch (error) {
    console.error('Error while fetching community members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Get community members by community ID
app.get('/v1/community/me/members', verifyToken, async (req, res) => {
  try {
    const communityId = req.body.id;// its also working for objectid of mongodb , not for community id of user

    // Find the community by ID
    const community = await Comm.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Fetch members of the community
    const members = await User.find({ _id: { $in: community.members } });

    res.status(200).json({ members });
  } catch (error) {
    console.error('Error while fetching community members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// using isadmin middleware to check if user  is admin few mistakes are there but due to insufficient time they are left behind but could make better.

// app.post('/v1/member',isAdmin, async(req,res)=>{

//   try{
//     const {community,user,role}=req.body;
//     const member=new Member({
//       community,user,role
//     }); 
//   await member.save();
//   res.status(201).json({ message:member});
// } catch (error) {
//   console.error('Error during member:', error);
//   res.status(500).json({ message: 'Internal server error' });
// }
  

// })






app.listen(3000,()=>{
    console.log('listening on port 3000');
})