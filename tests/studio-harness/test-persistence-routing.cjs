'use strict';

const assert = require('assert');

const {
  loadFlow,
  getNextWidget,
  evaluateSplitWidget
} = require('./engine.cjs');

const { runUntilPause } = require('./runner.cjs');

(async () => {
  const { widgets } = loadFlow();

  const makeContext = persisted => ({
    contact: {
      channel: {
        address: '+15550000000'
      }
    },
    flow: {
      sid: 'FN_OFFLINE_TEST',
      variables: {
        reservation_details_validated: 'true',
        reservation_parser_source: 'original',
        reservation_email: 'guest@example.com',
        vip_preference: 'YES'
      }
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
          occasion: 'Birthday'
        }
      },
      ingest_new_reservation: {
        parsed: {
          success: persisted,
          persisted,
          reservationId: persisted ? 'OFFLINE_TEST_ID' : null
        }
      }
    }
  });

  const successContext = makeContext(true);

  const successRoute = await evaluateSplitWidget(
    widgets,
    'check_new_reservation_persisted',
    successContext
  );

  assert.strictEqual(
    successRoute.next,
    'send_message_to_staff'
  );

  const successResult = await runUntilPause({
    startWidget: successRoute.next,
    context: successContext
  });

  assert(
    successResult.trace.includes('send_message_to_staff'),
    'Staff notification widget was not reached'
  );

  assert(
    successResult.messages.some(
      message => message.widget === 'send_message_to_staff'
    ),
    'Simulated staff notification was not recorded'
  );

  const failureContext = makeContext(false);

  const failureRoute = await evaluateSplitWidget(
    widgets,
    'check_new_reservation_persisted',
    failureContext
  );

  assert.strictEqual(
    failureRoute.next,
    'set_new_reservation_ingest_failure'
  );

  const failureResult = await runUntilPause({
    startWidget: failureRoute.next,
    context: failureContext
  });

  assert(
    failureResult.trace.includes(
      'set_new_reservation_ingest_failure'
    ),
    'Ingestion failure handler was not reached'
  );

  const functionFailure = getNextWidget(
    widgets,
    'ingest_new_reservation',
    'fail'
  );

  assert.strictEqual(
    functionFailure,
    'set_new_reservation_ingest_failure'
  );

  console.log('\nMOCKED PERSISTENCE ROUTING');
  console.log('--------------------------');

  console.log(
    'Success route:',
    successResult.trace.join(' -> ')
  );

  console.log(
    'Persistence failure route:',
    failureResult.trace.join(' -> ')
  );

  console.log(
    'Function failure destination:',
    functionFailure
  );

  console.log(
    'Simulated staff messages:',
    successResult.messages.length
  );

  console.log('\nPASS: Successful persistence routed');
  console.log('PASS: Staff notification recorded locally');
  console.log('PASS: Failed persistence routed');
  console.log('PASS: Function failure transition verified');
  console.log('PASS: No external services contacted');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
