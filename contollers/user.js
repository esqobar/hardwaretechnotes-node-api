 const bcrypt = require('bcrypt')
 const User = require('../models/user')
 const Note = require('../models/note')

 const getAllUsers = async (req, res) => {
     const users = await User.find().select('-password').lean()
     if(!users?.length) {
         return res.status(400).json({message: 'No users found'})
     }
     res.json(users)
 }

 const createUser = async (req, res) => {
     const { username, password, roles } = req.body

     //confirming data presence
     if(!username || !password){
         return res.status(400).json({ message:'all fields are required'})
     }

     //checking if a uer already exist
     const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
     if(duplicate){
         return res.status(409).json({message: 'Username already exists'})
     }

     //hashing the password
     const passHashed =  await bcrypt.hash(password, 10)
     
     const userObject = (!Array.isArray(roles) || !roles.length)
        ? { username, "password": hashedPwd }
        : { username, "password": hashedPwd, roles }

     //creating and saving the new user
     const user = await User.create(userObject)
     if(user) {
         res.status(201).json({ message: `New user ${username} created successfully`})
     } else {
         res.status(400).json({ message: 'Invalid user data'})
     }
 }

 const updateUser = async (req, res) => {
     const { id, username, roles, active, password } = req.body

     //confirming data
     if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean'){
         return res.status(400).json({ message: 'All fields are required'})
     }

     const user = await User.findById(id).exec()
     if(!user){
         return res.status(400).json({ message: 'User not found'})
     }

     //checking for duplicates
     const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
     //allowing updates to the original user
     if(duplicate && duplicate?._id.toString() !== id){
         return res.status(409).json({message: 'Username already exists'})
     }

     user.username = username
     user.roles = roles
     user.active = active

     if(password){
         //hashing the password
         user.password = await bcrypt.hash(password, 10)
     }

     const updatedUser = await user.save()

     res.json({message: `${updatedUser.username} updated`})
 }

 const deleteUsers = async (req, res) => {
     const { id } = req.body

     if(!id){
         return res.status(400).json({ message: 'User Id Required'})
     }

     const note = await Note.findOne({ user: id }).lean().exec()
     if(note){
         return res.status(400).json({message: 'User has assigned notes'})
     }

     const user = await User.findById(id).exec()
     if(!user){
         return res.status(400).json({ message: 'User not found'})
     }

     const result = await user.deleteOne()
     const reply = `Username ${result.username} with ID ${result._id} deleted successfully`

     res.json(reply)
 }

module.exports = { getAllUsers, createUser, updateUser, deleteUsers }
