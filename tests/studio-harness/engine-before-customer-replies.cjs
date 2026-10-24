'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { Liquid } = require('liquidjs');

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


function getNextWidget(widgets, widgetName, event) {
  const widget = widgets.get(widgetName);

  assert(widget, `Unknown widget: ${widgetName}`);

  const transition = (widget.transitions || []).find(
    item => item.event === event
  );

  assert(
    transition,
    `No transition for ${widgetName} on event ${event}`
  );

  if (!transition.next) {
    return null;
  }

  assert(
    widgets.has(transition.next),
    `Unknown destination: ${transition.next}`
  );

  return transition.next;
}

function simulateTransitions(widgets, startWidget, events) {
  assert(Array.isArray(events), 'Events must be an array');
  assert(widgets.has(startWidget), 'Unknown starting widget');

  const trace = [startWidget];
  let current = startWidget;

  for (const event of events) {
    if (current === null) {
      throw new Error('Cannot continue after Flow termination');
    }

    const next = getNextWidget(widgets, current, event);

    if (next === null) {
      trace.push('END');
      current = null;
      break;
    }

    trace.push(next);
    current = next;
  }

  return {
    trace,
    current,
    ended: current === null
  };
}


function evaluateCondition(condition, input) {
  const actual = String(input ?? '');
  const expected = String(condition.value ?? '');

  switch (condition.type) {
    case 'equal_to':
      return actual === expected;

    case 'regex':
      return new RegExp(expected).test(actual);

    default:
      throw new Error(
        `Unsupported condition operator: ${condition.type}`
      );
  }
}

function getConditionalNextWidget(widgets, widgetName, input) {
  const widget = widgets.get(widgetName);

  assert(widget, `Unknown widget: ${widgetName}`);

  assert.strictEqual(
    widget.type,
    'split-based-on',
    `Not a Split widget: ${widgetName}`
  );

  const transitions = widget.transitions || [];

  for (const transition of transitions) {
    if (transition.event !== 'match') continue;

    const conditions = transition.conditions || [];

    if (
      conditions.length > 0 &&
      conditions.every(condition => evaluateCondition(condition, input))
    ) {
      return transition.next || null;
    }
  }

  const fallback = transitions.find(
    transition => transition.event === 'noMatch'
  );

  assert(
    fallback,
    `Missing noMatch transition: ${widgetName}`
  );

  return fallback.next || null;
}


const liquid = new Liquid({
  strictVariables: false,
  strictFilters: false
});

async function renderLiquid(template, context = {}) {
  assert.strictEqual(
    typeof template,
    'string',
    'Liquid template must be a string'
  );

  return liquid.parseAndRender(template, context);
}


async function evaluateSplitWidget(widgets, widgetName, context = {}) {
  const widget = widgets.get(widgetName);

  assert(widget, `Unknown widget: ${widgetName}`);

  assert.strictEqual(
    widget.type,
    'split-based-on',
    `Not a Split widget: ${widgetName}`
  );

  const inputTemplate = widget.properties?.input;

  assert.strictEqual(
    typeof inputTemplate,
    'string',
    `Missing Split input: ${widgetName}`
  );

  const renderedInput = (
    await renderLiquid(inputTemplate, context)
  ).trim();

  const next = getConditionalNextWidget(
    widgets,
    widgetName,
    renderedInput
  );

  return {
    widget: widgetName,
    input: renderedInput,
    next,
    ended: next === null
  };
}


async function executeSetVariables(widgets, widgetName, context) {
  const widget = widgets.get(widgetName);

  assert(widget, `Unknown widget: ${widgetName}`);

  assert.strictEqual(
    widget.type,
    'set-variables',
    `Not a Set Variables widget: ${widgetName}`
  );

  assert(
    context && typeof context === 'object',
    'Simulation context is required'
  );

  context.flow ??= {};
  context.flow.variables ??= {};

  const assignments = widget.properties?.variables || [];
  const updates = {};

  // Render all values before applying them so the results
  // reflect the context at the start of this widget.
  for (const assignment of assignments) {
    assert(assignment.key, 'Variable assignment has no key');

    const rendered = await renderLiquid(
      String(assignment.value ?? ''),
      context
    );

    updates[assignment.key] = rendered.trim();
  }

  Object.assign(context.flow.variables, updates);

  return {
    widget: widgetName,
    updates,
    next: getNextWidget(widgets, widgetName, 'next')
  };
}

module.exports = {
  loadFlow,
  SUPPORTED_TYPES,
  getNextWidget,
  simulateTransitions,
  evaluateCondition,
  getConditionalNextWidget,
  renderLiquid,
  evaluateSplitWidget,
  executeSetVariables
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
