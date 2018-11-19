module.exports = class Message {
  constructor(id, text, fromUser, toUser, date) {
    this.id = id;
    this.text = text;
    this.fromUser = fromUser;
    this.toUser = toUser;
    this.date = date;
  }
}