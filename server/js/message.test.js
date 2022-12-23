let expect = require('expect');

var {generateMessage} = require('./message')

describe('Generate Message', () => {
    it('should generate a correct message object', () => {
        let from = "Test user",
            text = "Some random text",
            message = generateMessage(from,text);

        let x = message.createdAt;
        expect(typeof x).toBe('number');


    });
});