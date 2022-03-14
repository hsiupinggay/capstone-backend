/* eslint-disable no-else-return */
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
    try {
      // Find all user's contacts
      const allContacts = await this.model.findOne({ _id: userId }, { contacts: 1 });

      // Find incoming requests
      const incomingRequests = await this.contactRequestModel.find({ 'recipient.recipientId': userId, hasAccepted: { $exists: false } }, { sender: 1 });

      // Find pending outgoing requests
      const outgoingRequestsPending = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: { $exists: false } }, { recipient: 1 });

      // Find rejected outgoing requests
      const outgoingRequestsRejected = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: false }, { recipient: 1 });

      // Find accepted outgoing requests
      const outgoingRequestsAccepted = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: true }, { recipient: 1 });

      return this.successHandler(res, 200, {
        allContacts, incomingRequests, outgoingRequestsRejected, outgoingRequestsAccepted, outgoingRequestsPending,
      });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Remove contact request outcome from DB
  async removeNotification(req, res) {
    const { notificationId, userId, status } = req.body;
    try {
      // Delete request document from DB
      await this.contactRequestModel.deleteOne({ _id: notificationId });

      let updatedRequests;
      // Retrieve updated list of requests
      if (status === 'accepted') {
        updatedRequests = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: true }, { recipient: 1 });
      } else {
        updatedRequests = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: false }, { recipient: 1 });
      }

      return this.successHandler(res, 200, { updatedRequests });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Modify DB based on user request decision
  async handleRequest(req, res) {
    const {
      notificationId, userId, status, senderId, firstName, lastName, photo,
    } = req.body;
    try {
      // Find contact request document
      const requestDoc = await this.contactRequestModel.findOne({ _id: notificationId });

      if (status === 'accepted') {
        // Update document based on user's decision
        requestDoc.hasAccepted = true;
        await requestDoc.save();

        // Add contact to users document
        const user = await this.model.findOne({ _id: userId });
        user.contacts.push({
          contactId: senderId,
          firstName,
          lastName,
          photo,
        });
        await user.save();

        // Retrieve updated list of contacts
        const allContacts = await this.model.findOne({ _id: userId }, { contacts: 1 });
        // Retrieve updated list of requests
        const incomingRequests = await this.contactRequestModel.find({ 'recipient.recipientId': userId, hasAccepted: { $exists: false } }, { sender: 1 });
        return this.successHandler(res, 200, { allContacts, incomingRequests });
      } else {
        // Update document based on user's decision
        requestDoc.hasAccepted = false;
        await requestDoc.save();

        // Retrieve updated list of requests
        const incomingRequests = await this.contactRequestModel.find({ 'recipient.recipientId': userId, hasAccepted: { $exists: false } }, { sender: 1 });
        return this.successHandler(res, 200, { incomingRequests });
      }
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }
}

module.exports = ContactsController;
