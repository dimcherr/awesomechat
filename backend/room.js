module.exports = class Room {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.messages = [];
  }

  addUser(user) {
    if (this.users && !this.users.find(u => u.id === user.id)) this.users.push(user);
  }

  removeUser(user) {
    if (this.users)
      this.users = this.users.filter(u => user.id === u.id);
  }

  addMessage(message) {
    if (this.messages && !this.messages.find(m => m.id === message.id))
      this.messages.push(message);
  }

  removeMessage(message) {
    if (this.messages)
      this.messages = this.messages.filter(m => message.id === m.id);
  }
}
