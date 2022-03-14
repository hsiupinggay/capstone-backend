/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/*
 * ========================================================
 * ========================================================
 *
 *                      Imports
 *
 * ========================================================
 * ========================================================
 */
const BaseController = require('./baseController');

/*
 * ========================================================
 * ========================================================
 *
 *                    Contacts Controller
 *
 * ========================================================
 * ========================================================
 */
class ContactsController extends BaseController {
  constructor(model, patientModel, contactRequestModel) {
    super(model);
    this.patientModel = patientModel;
    this.contactRequestModel = contactRequestModel;
  }

  // Get data for all contacts related to user, outgoing and incoming requests & responses
  async loadPage(req, res) {
    const { userId } = req.query;
    console.log(userId);
    try {
      // Find all user's contacts
      const allContacts = await this.model.findOne({ _id: userId }, { contacts: 1 });
      console.log('allContacts', allContacts);

      // Find incoming requests
      const incomingRequests = await this.contactRequestModel.find({ 'recipient.recipientId': userId, hasAccepted: { $exists: false } }, { sender: 1 });
      console.log('===========INCOMING REQ=======', incomingRequests);

      // Find pending outgoing requests
      const outgoingRequestsPending = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: { $exists: false } }, { recipient: 1 });
      console.log('===========OUTGOING PENDING=======', outgoingRequestsPending);

      // Find rejected outgoing requests
      const outgoingRequestsRejected = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: false }, { recipient: 1 });
      console.log('===========OUTGOING REJECTED=======', outgoingRequestsRejected);

      // Find accepted outgoing requests
      const outgoingRequestsAccepted = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: true }, { recipient: 1 });
      console.log('===========OUTGOING ACCEPTED=======', outgoingRequestsAccepted);

      return this.successHandler(res, 200, {
        allContacts, incomingRequests, outgoingRequestsRejected, outgoingRequestsAccepted, outgoingRequestsPending,
      });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }
}

module.exports = ContactsController;
