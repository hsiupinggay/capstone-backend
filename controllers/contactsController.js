/* eslint-disable max-len */
/* eslint-disable no-else-return */
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
        allContacts,
        incomingRequests,
        outgoingRequestsRejected,
        outgoingRequestsAccepted,
        outgoingRequestsPending,
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

        // Add senders contact to user's document
        const user = await this.model.findOne({ _id: userId });
        user.contacts.push({
          contactId: senderId,
          firstName,
          lastName,
          photo,
        });
        await user.save();

        // Add users contact to sender's document
        const sender = await this.model.findOne({ _id: senderId });
        sender.contacts.push({
          contactId: userId,
          firstName: user.identity.name.first,
          lastName: user.identity.name.last,
          photo: user.identity.photo,
        });
        await sender.save();

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

  // When user opens add new contact popup, retrieve list of other users
  async getContacts(req, res) {
    const {
      userId,
    } = req.query;

    try {
      // Array of userIds to exlclude
      const excludeIds = [];

      // Find all recipient userIds for requests sent by user
      const outgoingRequests = await this.contactRequestModel.find({ 'sender.senderId': userId }, { 'recipient.recipientId': 1 });
      outgoingRequests.forEach((request) => (excludeIds.push(request.recipient.recipientId)));

      // Find all sender userIds for requests sent to user
      const incomingRequests = await this.contactRequestModel.find({ 'recipient.recipientId': userId, hasAccepted: { $exists: false } }, { sender: 1 });
      incomingRequests.forEach((request) => (excludeIds.push(request.sender.senderId)));

      // Find all userIds of current user's existing contacts
      const usersContacts = await this.model.findOne({ _id: userId }, { 'contacts.contactId': 1 });
      usersContacts.contacts.forEach((contact) => (excludeIds.push(contact.contactId)));

      // Exclude user's userId
      excludeIds.push(userId);

      // Find list of other users
      const otherUsers = await this.model.find({ _id: { $nin: excludeIds } });

      return this.successHandler(res, 200, { otherUsers });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // When user adds new contact, create contact request in DB
  async addContact(req, res) {
    const {
      contactId,
      contactFirstName,
      contactLastName,
      contactPhoto,
      userId,
      firstName,
      lastName,
      photo,
    } = req.body;

    try {
      // Create new request in DB
      await this.contactRequestModel.create({
        sender: {
          senderId: userId,
          firstName,
          lastName,
          photo,
        },
        recipient: {
          recipientId: contactId,
          firstName: contactFirstName,
          lastName: contactLastName,
          photo: contactPhoto,
        },
      });

      // Get updated list of users who are not contacts or have pending requests
      // Array of userIds to exlclude
      const excludeIds = [];

      // Find all recipient userIds for requests sent by user
      const outgoingRequests = await this.contactRequestModel.find({ 'sender.senderId': userId }, { 'recipient.recipientId': 1 });
      outgoingRequests.forEach((request) => (excludeIds.push(request.recipient.recipientId)));

      // Find all sender userIds for requests sent to user
      const incomingRequests = await this.contactRequestModel.find({ 'recipient.recipientId': userId, hasAccepted: { $exists: false } }, { sender: 1 });
      incomingRequests.forEach((request) => (excludeIds.push(request.sender.senderId)));

      // Find all userIds of current user's existing contacts
      const usersContacts = await this.model.findOne({ _id: userId }, { 'contacts.contactId': 1 });
      usersContacts.contacts.forEach((contact) => (excludeIds.push(contact.contactId)));

      // Exclude user's userId
      excludeIds.push(userId);

      // Find list of other users
      const otherUsers = await this.model.find({ _id: { $nin: excludeIds } });

      // Get updated list of users pending requests
      const outgoingRequestsPending = await this.contactRequestModel.find({ 'sender.senderId': userId, hasAccepted: { $exists: false } }, { recipient: 1 });

      return this.successHandler(res, 200, { otherUsers, outgoingRequestsPending });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  //  When user opens contact settings, retrieve and send patient visibility
  async findVisiblePatients(req, res) {
    const {
      userId, contactId,
    } = req.query;

    try {
      // Find contact's visibile patients
      const contact = await this.model.findOne({ _id: userId }, { contacts: { $elemMatch: { contactId } } });
      const { visiblePatients } = contact.contacts[0];

      // Extract ids
      const excludeIds = [];
      visiblePatients.forEach((obj) => excludeIds.push(obj.patientId.toString()));

      // Find all other patients that user is admin for
      const allPatients = await this.model.findOne({ _id: userId }, { patients: 1 });
      const { patients } = allPatients;
      const otherPatients = [];
      for (let i = 0; i < patients.length; i += 1) {
        if (!(excludeIds.includes(patients[i].patientId.toString()))
        && patients[i].admin.toString() === userId.toString()) {
          otherPatients.push(patients[i]);
        }
      }

      return this.successHandler(res, 200, { visiblePatients, otherPatients });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Remove contacts access to patients data
  async removeAccess(req, res) {
    const {
      userId, contactId, patientId,
    } = req.body;

    try {
      // Remove patient's details from user's contact subdocument
      const user = await this.model.findOne({ _id: userId });
      let latestVisiblePatients = [];
      for (let i = 0; i < user.contacts.length; i += 1) {
        // Find contact in array
        if (user.contacts[i].contactId.toString() === contactId.toString()) {
          // Remove patient for visiblePatients array
          latestVisiblePatients = user.contacts[i].visiblePatients.filter((patient) => patient.patientId.toString() !== patientId.toString());
          user.contacts[i].visiblePatients = latestVisiblePatients;
          break;
        }
      }
      await user.save();

      // Remove patient's details from contact's document
      const contactsDoc = await this.model.findOne({ _id: contactId }, { patients: 1 });
      const patientsArr = contactsDoc.patients;
      const updatedPatientsArr = patientsArr.filter((patient) => patient.patientId.toString() !== patientId.toString());
      contactsDoc.patients = updatedPatientsArr;
      await contactsDoc.save();

      // Extract ids from updatedVisiblePatients
      const excludeIds = [];
      latestVisiblePatients.forEach((obj) => excludeIds.push(obj.patientId.toString()));

      // Find all other patients that user is admin for
      const allPatients = await this.model.findOne({ _id: userId }, { patients: 1 });
      const { patients } = allPatients;
      const otherPatients = [];
      for (let i = 0; i < patients.length; i += 1) {
        if (!(excludeIds.includes(patients[i].patientId.toString()))
        && patients[i].admin.toString() === userId.toString()) {
          otherPatients.push(patients[i]);
        }
      }

      return this.successHandler(res, 200, { visiblePatients: latestVisiblePatients, otherPatients });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }

  // Give contact access to patients data
  async giveAccess(req, res) {
    const {
      userId, contactId, patientId, name, admin,
    } = req.body;

    try {
      // Add patient's details to user's contact subdocument
      const user = await this.model.findOne({ _id: userId });
      let latestVisiblePatients = [];
      for (let i = 0; i < user.contacts.length; i += 1) {
        // Find contact in array
        if (user.contacts[i].contactId.toString() === contactId.toString()) {
          // Add patient to visiblePatients array
          user.contacts[i].visiblePatients.push({
            patientId,
            admin,
            name,
          });
          latestVisiblePatients = user.contacts[i].visiblePatients;
          break;
        }
      }
      await user.save();

      // Add patient's details to contacts document
      const contactsDoc = await this.model.findOne({ _id: contactId }, { patients: 1 });
      contactsDoc.patients.push({
        patientId,
        name,
        admin,
      });
      await contactsDoc.save();

      // Extract ids from updatedVisiblePatients
      const excludeIds = [];
      latestVisiblePatients.forEach((obj) => excludeIds.push(obj.patientId.toString()));

      // Find all other patients that user is admin for
      const allPatients = await this.model.findOne({ _id: userId }, { patients: 1 });
      const { patients } = allPatients;
      const otherPatients = [];
      for (let i = 0; i < patients.length; i += 1) {
        if (!(excludeIds.includes(patients[i].patientId.toString()))
        && patients[i].admin.toString() === userId.toString()) {
          otherPatients.push(patients[i]);
        }
      }

      return this.successHandler(res, 200, { visiblePatients: latestVisiblePatients, otherPatients });
    } catch (err) {
      return this.errorHandler(res, 400, { err });
    }
  }
}

module.exports = ContactsController;
