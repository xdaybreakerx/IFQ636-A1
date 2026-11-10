const { expect } = require('chai');
const sinon = require('sinon');
const Event = require('../models/Event');

describe('Event isFeedbackOpen()', () => {
    const start = new Date('2026-11-01T09:00:00Z');
    const end = new Date('2026-11-01T17:00:00Z');
    const closesAt = end.getTime() + 240 * 60 * 60 * 1000;
    let clock;

    const makeEvent = (status) =>
        new Event({
            title: 'Test event',
            startDate: start,
            endDate: end,
            status,
        });

    afterEach(() => {
        clock.restore();
    });

    it('is closed before the event starts', () => {
        clock = sinon.useFakeTimers(start.getTime() - 1);
        expect(makeEvent('open').isFeedbackOpen()).to.equal(false);
    });

    it('is open from the event start', () => {
        clock = sinon.useFakeTimers(start.getTime());
        expect(makeEvent('open').isFeedbackOpen()).to.equal(true);
    });

    it('is still open just before end + 240h', () => {
        clock = sinon.useFakeTimers(closesAt - 1);
        expect(makeEvent('open').isFeedbackOpen()).to.equal(true);
    });

    it('is closed at exactly end + 240h even if status is open', () => {
        clock = sinon.useFakeTimers(closesAt);
        expect(makeEvent('open').isFeedbackOpen()).to.equal(false);
    });

    it('is closed for draft and closed events inside the window', () => {
        clock = sinon.useFakeTimers(start.getTime() + 1000);
        expect(makeEvent('draft').isFeedbackOpen()).to.equal(false);
        expect(makeEvent('closed').isFeedbackOpen()).to.equal(false);
    });
});
