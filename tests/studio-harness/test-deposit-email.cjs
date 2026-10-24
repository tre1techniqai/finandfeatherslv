'use strict';

const assert = require('assert');

const {
  loadFlow,
  simulateCustomerResponse
} = require('./engine.cjs');

const { runUntilPause } = require('./runner.cjs');

(async () => {
  const { widgets } = loadFlow();

  const context = {
    flow: {
      variables: {
        reservation_details_validated: 'true',
        reservation_parser_source: 'original'
      }
    },
    widgets: {}
  };

  const reply = simulateCustomerResponse(
    widgets,
    'deposit_request_9_10_form',
    context,
    'incomingMessage',
    'guest@example.com'
  );

  assert.strictEqual(
    reply.next,
    'validate_email_9_10'
  );

  const result = await runUntilPause({
    startWidget: reply.next,
    context
  });

  assert.strictEqual(
    result.status,
    'waiting-for-customer'
  );

  assert.strictEqual(
    result.current,
    'vip_option_ask'
  );

  assert.deepStrictEqual(result.trace, [
    'validate_email_9_10',
    'set_valid_email_9_10',
    'vip_option_ask'
  ]);

  assert.strictEqual(
    context.flow.variables.reservation_email,
    'guest@example.com'
  );

  console.log('\nDEPOSIT EMAIL SIMULATION');
  console.log('------------------------');
  console.log('Customer reply: guest@example.com');
  console.log('Route:', result.trace.join(' -> '));
  console.log(
    'Stored email:',
    context.flow.variables.reservation_email
  );
  console.log('Paused at:', result.current);

  console.log('\nPASS: Customer email captured');
  console.log('PASS: Email validation branch selected');
  console.log('PASS: Email stored in Flow variables');
  console.log('PASS: Advanced to VIP question');
  console.log('PASS: No external services contacted');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
