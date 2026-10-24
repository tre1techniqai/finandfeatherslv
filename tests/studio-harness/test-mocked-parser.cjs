'use strict';

const assert = require('assert');

const { loadFlow, getNextWidget } = require('./engine.cjs');
const { runUntilPause } = require('./runner.cjs');

(async () => {
  const { widgets } = loadFlow();

  const context = {
    flow: {
      variables: {}
    },
    widgets: {
      test_parse_reservation: {
        parsed: {
          isValid: true,
          name: 'Test Guest',
          date: '2026-11-14',
          time: '7:00 PM',
          guests: 10,
          partySize: 10,
          occasion: 'Birthday',
          errors: [],
          errorMessage: ''
        }
      }
    }
  };

  const next = getNextWidget(
    widgets,
    'test_parse_reservation',
    'success'
  );

  assert.strictEqual(
    next,
    'check_reservation_validity'
  );

  const result = await runUntilPause({
    startWidget: next,
    context
  });

  assert.strictEqual(
    result.status,
    'waiting-for-customer'
  );

  assert.strictEqual(
    result.current,
    'deposit_request_9_10_form'
  );

  assert.deepStrictEqual(result.trace, [
    'check_reservation_validity',
    'set_original_details_validated',
    'route_by_party_size',
    'deposit_request_9_10_form'
  ]);

  assert.strictEqual(
    context.flow.variables.reservation_details_validated,
    'true'
  );

  assert.strictEqual(
    context.flow.variables.reservation_parser_source,
    'original'
  );

  console.log('\nMOCKED PARSER EXECUTION');
  console.log('-----------------------');
  console.log(
    'Function:',
    'test_parse_reservation (mocked success)'
  );
  console.log('Route:', result.trace.join(' -> '));
  console.log('Paused at:', result.current);

  console.log('\nPASS: Mocked Function response accepted');
  console.log('PASS: Valid reservation branch selected');
  console.log('PASS: Original parser variables stored');
  console.log('PASS: Party of 10 routed to deposit request');
  console.log('PASS: Customer interaction paused safely');
  console.log('PASS: No external services contacted');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
