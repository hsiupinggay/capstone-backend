/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const { default: axios } = require('axios');
const BaseController = require('./baseController');

const { TELEGRAM_API } = process.env;
/*
 * ========================================================
 * ========================================================
 *
 *                    Patient Controller
 *
 * ========================================================
 * ========================================================
 */

class MessageController extends BaseController {
  constructor(model, userModel) {
    super(model);
    this.userModel = userModel;
  }

  // async sendMessage(req, res) {
  //   // await axios.post(`${TELEGRAM_API}/sendMessage`, {
  //   //   chat_id=

  //   // });
  //   this.successHandler(res, 200, { sendMessage: true });
  // }

  async getMessage(req, res) {
    console.log('<== telegram bot req.body ==>', req.body);
    const chatId = req.body.message.chat.id;
    if (req.body.message.text === '/patient') {
      const result = await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: 'Enter the patient id string',
        reply_markup: JSON.stringify({ force_reply: true }),
      });
      console.log('<== res patient_id ==>', result.data);
    }

    if (req.body.message.reply_to_message) {
      if (req.body.message.reply_to_message.text === 'Enter the patient id string') {
        const { text } = req.body.message;
        const { id, username } = req.body.message.chat;
        const patientId = text.toString();
        const telegramUserId = id.toString();
        const userName = username.toString();
        // find patient in db to add telegram user to patient
        const patient = await this.model.findOne({ _id: patientId });

        // get patient name for customised message to confirm subscription
        const patientName = patient.identity.name.first;

        patient.medEmailList.push({ email: telegramUserId, name: userName });
        patient.save();

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: id,
          text: `You are subscribed to ${patientName}'s medication refill reminders`,
        });
      }
    }
    this.successHandler(res, 200, { telebotRunning: true });
  }
}
module.exports = MessageController;
