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

  const scenarios = [
    {
      name: 'Incomplete reservation',
      functionWidget: 'ingest_incomplete_reservation',
      splitWidget: 'check_incomplete_reservation_persisted',
      successWidget: 'send_incomplete_reservation_to_staff',
      failureWidget: 'set_incomplete_reservation_ingest_failure',
      failureMessageWidget: 'send_incomplete_ingestion_failure_to_staff'
    },
    {
      name: 'Unvalidated reservation',
      functionWidget: 'ingest_unvalidated_reservation',
      splitWidget: 'check_unvalidated_reservation_persisted',
      successWidget: 'send_unvalidated_reservation_to_staff',
      failureWidget: 'set_unvalidated_reservation_ingest_failure',
      failureMessageWidget: 'send_unvalidated_ingestion_failure_to_staff'
    }
  ];

  for (const scenario of scenarios) {
    const makeContext = persisted => ({
      contact: {
        channel: {
          address: '+15550000000'
        }
      },
      flow: {
        sid: 'FN_OFFLINE_TEST',
        variables: {
          reservation_details_validated: 'false',
          reservation_parser_source: 'original',
          reservation_email: 'NOT PROVIDED',
          vip_preference: 'NOT PROVIDED'
        }
      },
      widgets: {
        [scenario.functionWidget]: {
          parsed: {
            success: persisted,
            persisted
          }
        }
      }
    });

    const successContext = makeContext(true);

    const success = await evaluateSplitWidget(
      widgets,
      scenario.splitWidget,
      successContext
    );

    assert.strictEqual(success.next, scenario.successWidget);

    const successRun = await runUntilPause({
      startWidget: success.next,
      context: successContext
    });

    assert(
      successRun.messages.some(
        message => message.widget === scenario.successWidget
      ),
      'Expected simulated staff notification'
    );

    const failureContext = makeContext(false);

    const failure = await evaluateSplitWidget(
      widgets,
      scenario.splitWidget,
      failureContext
    );

    assert.strictEqual(failure.next, scenario.failureWidget);

    const failureRun = await runUntilPause({
      startWidget: failure.next,
      context: failureContext
    });

    assert(
      failureRun.trace.includes(scenario.failureMessageWidget),
      'Expected ingestion failure notification'
    );

    const functionFailure = getNextWidget(
      widgets,
      scenario.functionWidget,
      'fail'
    );

    assert.strictEqual(
      functionFailure,
      scenario.failureWidget
    );

    console.log('\n' + scenario.name.toUpperCase());
    console.log('--------------------------------');
    console.log('Success:', successRun.trace.join(' -> '));
    console.log('Failure:', failureRun.trace.join(' -> '));
    console.log('Function failure:', functionFailure);
    console.log('PASS: Success and failure routes verified');
  }

  console.log('\nPASS: Both ingestion paths tested');
  console.log('PASS: Staff notifications recorded locally');
  console.log('PASS: Function failure transitions verified');
  console.log('PASS: No external services contacted');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
