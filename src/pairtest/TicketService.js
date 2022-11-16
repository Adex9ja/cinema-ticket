import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Return value
    let returnValue = -1;

    if(accountId <= 0){
      throw new InvalidPurchaseException("Invalid accountId", `Invalid account Id: ${accountId}`);
    }

    // Check if the number of the ticket types bought is already over the limit, then there will be no need to check how many tickets bought in total
    if(ticketTypeRequests.length <= 0){
      throw new InvalidPurchaseException("Tickets cannot be less than 1", "Minimum number of tickets not bought");
    }else if(ticketTypeRequests.length > 20){
      throw new InvalidPurchaseException("Maximum number of tickets exceeded", `Maximum number of tickets exceeded by: ${ticketTypeRequests.length - 20}`);
    }else{
      let ticketType = this.#getNumSeatsAmount(...ticketTypeRequests);

      // Make payment
      new TicketPaymentService().makePayment(accountId, ticketType.totalAmount);

      // Reserve seats
      new SeatReservationService().reserveSeat(accountId, ticketType.noAdult + ticketType.noChild)

      // Return total amount and number of seats, if everything works smoothly
      returnValue = [ticketType.totalAmount, ticketType.noAdult + ticketType.noChild];
    }

    return returnValue;
  }

  // Gets the number of seats for each category of Ticket
  #getNumSeatsAmount(ticketTypeRequests){
    let noInfant = 0;
    let noChild = 0;
    let noAdult = 0;
    let totalAmount = 0;
    let amount = {
      infant : 0,
      child : 10,
      adult : 20
    }
    ticketTypeRequests.forEach(ticket => {
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
          throw new InvalidPurchaseException("Invalid ticket type", `Invalid ticket type: ${ticket.getTicketType()}`);
      }
    });

    // Get the total amount to pay
    totalAmount = amount.infant * noInfant + amount.child * noChild + amount.adult * noAdult;

    // Assumption: Only one Adult or Child is permitted to hold one Infant
    if(noAdult + noChild < noInfant){
      throw new InvalidPurchaseException("Cannot have more infants", `Invalid number of infants: ${noInfant}`);
    }

    return {
      noInfant,
      noChild,
      noAdult,
      totalAmount
    }
  }
}