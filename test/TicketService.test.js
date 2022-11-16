import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";

describe("TicketService methods testing", () => {
    let ticketService = new TicketService();
    let adults = new TicketTypeRequest("ADULT", 3);
    let infants = new TicketTypeRequest("INFANT", 5);
    let children = new TicketTypeRequest("CHILD", 5);

    test("Number of adults and children more than number of infants", () => {
        expect(ticketService.purchaseTickets(5, [adults, infants, children])).toEqual([110, 8]);
    });

    //
    test("Number of adults and children equal to number of infants", () => {
        let infants = new TicketTypeRequest("INFANT", 8);
        expect(ticketService.purchaseTickets(5, [adults, infants, children])).toEqual([110, 8]);
    });

    //
    test("Number of children more than number of infants and adults", () => {
        let children = new TicketTypeRequest("CHILD", 10);
        expect(ticketService.purchaseTickets(5, [adults, infants, children])).toEqual([160, 13]);
    });
});