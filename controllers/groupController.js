import { Group } from '../models/groupModel.js';
import { User } from '../models/userModel.js';

// Create Group
export const createGroup = async (req, res) => {
  const { name, createdBy, members } = req.body;

  try {
    const group = await Group.create({
      name,
      createdBy,
      members: members || [createdBy], // default to creator
    });

    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Add user to group
export const addUserToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    group.members.push(userId);
    await group.save();

    res.status(200).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
