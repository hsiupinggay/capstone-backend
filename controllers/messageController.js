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

  async getMessage(req, res) {
    if (!req.body.message) {
      return {
        errors: {
          406: 'NOT_ACCEPTABLE',
        },
      };
    }

    try {
      const chatId = req.body.message.chat.id;
      if (req.body.message.text === '/patient') {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: 'Enter the patient id string',
          reply_markup: JSON.stringify({ force_reply: true }),
        });
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
          await patient.save();

          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: id,
            text: `You are subscribed to ${patientName}'s medication refill reminders`,
          });
        }
      }
    } catch (err) {
      return {
        errors: {
          406: 'NOT_ACCEPTABLE',
        },
      };
    }
    return this.successHandler(res, 200, { telebotRunning: true });
  }
}

module.exports = MessageController;
