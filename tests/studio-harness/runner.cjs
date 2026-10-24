'use strict';

const assert = require('assert');

const {
  loadFlow,
  getNextWidget,
  evaluateSplitWidget,
  executeSetVariables,
  renderLiquid
} = require('./engine.cjs');

async function runUntilPause(options = {}) {
  const { widgets, initialState } = loadFlow();

  const context = options.context || {
    flow: { variables: {} },
    widgets: {}
  };

  context.flow ??= {};
  context.flow.variables ??= {};
  context.widgets ??= {};

  let current = options.startWidget || initialState;

  const trace = [];
  const messages = [];

  const maxSteps = options.maxSteps || 150;

  for (let step = 0; step < maxSteps; step++) {
    if (current === null) {
      return {
        status: 'ended',
        current: null,
        trace,
        messages,
        context
      };
    }

    const widget = widgets.get(current);

    assert(widget, `Unknown widget: ${current}`);

    trace.push(current);

    switch (widget.type) {
      case 'trigger':
        current = getNextWidget(
          widgets,
          current,
          'incomingMessage'
        );
        break;

      case 'set-variables': {
        const result = await executeSetVariables(
          widgets,
          current,
          context
        );

        current = result.next;
        break;
      }

      case 'split-based-on': {
        const result = await evaluateSplitWidget(
          widgets,
          current,
          context
        );

        current = result.next;
        break;
      }

      case 'send-message': {
        const body = await renderLiquid(
          String(widget.properties?.body ?? ''),
          context
        );

        const to = await renderLiquid(
          String(widget.properties?.to ?? ''),
          context
        );

        messages.push({
          widget: current,
          to,
          body,
          simulated: true
        });

        current = getNextWidget(
          widgets,
          current,
          'sent'
        );
        break;
      }

      case 'run-function':
        return {
          status: 'waiting-for-function',
          current,
          trace,
          messages,
          context
        };

      case 'send-and-wait-for-reply':
        return {
          status: 'waiting-for-customer',
          current,
          trace,
          messages,
          context
        };

      default:
        throw new Error(
          `Unsupported widget type: ${widget.type}`
        );
    }
  }

  throw new Error(
    `Simulation exceeded ${maxSteps} steps`
  );
}

module.exports = { runUntilPause };

if (require.main === module) {
  (async () => {
    const result = await runUntilPause();

    assert.strictEqual(
      result.status,
      'waiting-for-function'
    );

    assert.strictEqual(
      result.current,
      'test_parse_reservation'
    );

    assert.deepStrictEqual(
      result.trace,
      ['Trigger', 'test_parse_reservation']
    );

    assert.strictEqual(result.messages.length, 0);

    console.log('\nOFFLINE CONVERSATION RUNNER');
    console.log('---------------------------');
    console.log('Execution:', result.trace.join(' -> '));
    console.log('Paused at:', result.current);
    console.log('Status:', result.status);

    console.log('\nPASS: Flow started locally');
    console.log('PASS: Correct initial Function identified');
    console.log('PASS: Execution paused safely');
    console.log('PASS: No SMS messages sent');
    console.log('PASS: No external services contacted');
  })().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
