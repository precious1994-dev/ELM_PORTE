import mongoose from 'mongoose'

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  role: {
    type: String,
    required: [true, 'Role is required']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  }
}, {
  timestamps: true
})

// Check if the model exists before creating a new one
const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema)

export default TeamMember 