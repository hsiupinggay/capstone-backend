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
      const res = await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: 'Enter the patient id string',
        reply_markup: JSON.stringify({ force_reply: true }),
      });
      console.log('<== res patient_id ==>', res.data);
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

        patient.medEmailList.push({ email: telegramUserId, name: userName });
        patient.save();
      }
    }
    this.successHandler(res, 200, { telebotRunning: true });
  }
}
module.exports = MessageController;
