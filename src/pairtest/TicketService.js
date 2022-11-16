import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';
export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {

    if(accountId <= 0)
      throw new InvalidPurchaseException(`Invalid account Id: ${accountId}`);

    if(ticketTypeRequests.length <= 0)
      throw new InvalidPurchaseException("Tickets cannot be less than 1");

    if(ticketTypeRequests[0].length > 20)
      throw new InvalidPurchaseException("Maximum number of tickets exceeded");

    const hasAdult = ticketTypeRequests[0].some((ticket) => ticket.getTicketType() === 'ADULT');
    if(!hasAdult)
      throw new InvalidPurchaseException("At-least one adult ticket must be purchased");

    let { totalAmount, noAdult, noChild } = this.#getNumSeatsAmount(...ticketTypeRequests);
    let totalAllocation = noAdult + noChild;
    // Make payment
    new TicketPaymentService().makePayment(accountId, totalAmount);

    // Reserve seats
    new SeatReservationService().reserveSeat(accountId, totalAllocation);

    return { totalAmount, totalAllocation };
  }

  // Gets the number of seats for each category of Ticket
  #getNumSeatsAmount(ticketTypeRequests){
    let noInfant = 0;
    let noChild = 0;
    let noAdult = 0;

    let amount = {
      infant : 0,
      child : 10,
      adult : 20
    }
    ticketTypeRequests.forEach((ticket) => {
      switch(ticket.getTicketType()){
        case "INFANT":
          noInfant += ticket.getNoOfTickets();
          break;
        case "CHILD":
          noChild += ticket.getNoOfTickets();
          break;
        case "ADULT":
          noAdult += ticket.getNoOfTickets();
          break;
        default:
          throw new InvalidPurchaseException(`Invalid ticket type: ${ticket.getTicketType()}`);
      }
    });

    let totalAmount = amount.infant * noInfant + amount.child * noChild + amount.adult * noAdult;

    // Assumption: Only one Adult or Child is permitted to hold one Infant
    if(noAdult + noChild < noInfant){
      throw new InvalidPurchaseException(`Invalid number of infants: ${noInfant}`);
    }

    return {
      noInfant,
      noChild,
      noAdult,
      totalAmount
    }
  }
}