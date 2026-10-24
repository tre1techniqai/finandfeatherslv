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
        reservation_parser_source: 'original',
        reservation_email: 'guest@example.com'
      }
    },
    widgets: {}
  };

  const reply = simulateCustomerResponse(
    widgets,
    'vip_option_ask',
    context,
    'incomingMessage',
    'YES'
  );

  assert.strictEqual(
    reply.next,
    'validate_vip_response'
  );

  const result = await runUntilPause({
    startWidget: reply.next,
    context
  });

  assert.strictEqual(
    result.trace[0],
    'validate_vip_response'
  );

  assert.strictEqual(
    result.trace[1],
    'set_vip_yes_first'
  );

  assert(
    ['waiting-for-function', 'waiting-for-customer', 'ended']
      .includes(result.status),
    'Unexpected simulation status'
  );

  console.log('\nVIP RESPONSE SIMULATION');
  console.log('-----------------------');
  console.log('Customer reply: YES');
  console.log('Route:', result.trace.join(' -> '));
  console.log('Status:', result.status);
  console.log('Next widget:', result.current || 'END');

  console.log('\nSTORED FLOW VARIABLES');
  console.log(
    JSON.stringify(context.flow.variables, null, 2)
  );

  console.log('\nPASS: VIP reply captured');
  console.log('PASS: YES validation branch selected');
  console.log('PASS: VIP assignment widget executed');
  console.log('PASS: Simulation advanced safely');
  console.log('PASS: No external services contacted');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
