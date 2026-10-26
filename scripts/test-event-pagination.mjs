import assert from 'node:assert/strict';
import { fetchEventRows } from '../src/features/events/fetchEventRows.js';

function mockClient(rows, failFrom = -1) {
  const calls = [];
  const client = { from(table) {
    assert.equal(table, 'events');
    const order = [];
    const query = { select() { return query; }, order(field) { order.push(field); return query; }, async range(from, to) {
      calls.push([from, to]);
      assert.deepEqual(order, ['date', 'id']);
      return from === failFrom ? { data: null, error: { message: 'network failure' } } : { data: rows.slice(from, to + 1), error: null };
    } };
    return query;
  } };
  return { client, calls };
}
const fixture = Array.from({ length: 1003 }, (_, id) => ({ id, date: id < 1000 ? '2026-11-22' : '2027-09-17' }));
const many = mockClient(fixture);
assert.deepEqual((await fetchEventRows(many.client)).data, fixture);
assert.deepEqual(many.calls, [[0, 999], [1000, 1999]]);
const exact = mockClient(fixture.slice(0, 1000));
assert.equal((await fetchEventRows(exact.client)).data.length, 1000);
assert.equal(exact.calls.length, 2);
const failed = await fetchEventRows(mockClient(fixture, 1000).client);
assert.equal(failed.error.message, 'network failure');
assert.equal(failed.data.length, 1000);
const empty = await fetchEventRows(mockClient([]).client);
assert.deepEqual(empty, { data: [], error: null });
console.log('Event pagination: later dates, exact page boundary, partial failure and empty response passed.');
