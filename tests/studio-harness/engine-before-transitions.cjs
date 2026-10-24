'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const FLOW_PATH = path.resolve(
  __dirname,
  '../../.twilio-backups/fin-feathers-dev-revision-21-fetched.json'
);

const SUPPORTED_TYPES = new Set([
  'trigger',
  'run-function',
  'send-and-wait-for-reply',
  'send-message',
  'set-variables',
  'split-based-on'
]);

function loadFlow() {
  const raw = JSON.parse(fs.readFileSync(FLOW_PATH, 'utf8'));
  const flow = Array.isArray(raw) ? raw[0] : raw;

  assert(flow, 'Flow data is missing');
  assert(flow.definition, 'Flow definition is missing');
  assert(Array.isArray(flow.definition.states), 'Flow states are missing');

  const states = flow.definition.states;

  assert.strictEqual(states.length, 87, 'Expected 87 widgets');
  assert.strictEqual(flow.status, 'draft', 'Expected draft Flow');
  assert.strictEqual(flow.revision, 21, 'Expected revision 21');

  const widgets = new Map();

  for (const state of states) {
    assert(state.name, 'Widget has no name');

    assert(
      SUPPORTED_TYPES.has(state.type),
      `Unsupported widget type: ${state.type}`
    );

    assert(
      !widgets.has(state.name),
      `Duplicate widget name: ${state.name}`
    );

    widgets.set(state.name, state);
  }

  for (const state of states) {
    for (const transition of state.transitions || []) {
      if (!transition.next) continue;

      assert(
        widgets.has(transition.next),
        `Broken transition: ${state.name} -> ${transition.next}`
      );
    }
  }

  assert(
    widgets.has('Trigger'),
    'Trigger widget is missing'
  );

  return {
    flow,
    widgets,
    states,
    initialState: flow.definition.initial_state
  };
}

module.exports = {
  loadFlow,
  SUPPORTED_TYPES
};

if (require.main === module) {
  const result = loadFlow();

  console.log('\nFIN & FEATHERS — STUDIO HARNESS');
  console.log('--------------------------------');
  console.log('Flow:', result.flow.friendlyName);
  console.log('Revision:', result.flow.revision);
  console.log('Status:', result.flow.status);
  console.log('Widgets:', result.states.length);
  console.log('Initial state:', result.initialState);

  console.log('\nPASS: Flow loaded successfully');
  console.log('PASS: All 87 widgets validated');
  console.log('PASS: No duplicate widget names');
  console.log('PASS: All transition destinations exist');
  console.log('PASS: All widget types supported');
  console.log('PASS: No Twilio or Supabase connections');
}
