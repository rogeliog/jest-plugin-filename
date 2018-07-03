import { KEYS } from 'jest-watcher';
import pluginTester from './pluginTester';
import TestNamePlugin from '../test_name_plugin';

const testResults = [
  {
    testResults: [{ title: 'foo 1' }, { title: 'bar 1' }],
  },
  {
    testResults: [{ title: 'foo 2' }, { title: 'bar 2' }],
  },
];

it('shows the correct initial state', async () => {
  const { stdout, updateConfigAndRun, plugin, type } = pluginTester(
    TestNamePlugin,
  );

  const runPromise = plugin.run({}, updateConfigAndRun);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type(KEYS.ENTER);

  await runPromise;
});

it('shows the correct message when there are no cached tests', async () => {
  const { stdout, updateConfigAndRun, plugin, type } = pluginTester(
    TestNamePlugin,
  );

  const runPromise = plugin.run({}, updateConfigAndRun);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();
  type('t', KEYS.ENTER);

  await runPromise;
});

it('can use arrows to select a specific file', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(TestNamePlugin);

  hookEmitter.onTestRunComplete({ testResults });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', KEYS.ARROW_DOWN, KEYS.ARROW_DOWN, KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: 'foo 2',
  });
});

it('can select a pattern that matches multiple tests', async () => {
  const {
    stdout,
    hookEmitter,
    updateConfigAndRun,
    plugin,
    type,
  } = pluginTester(TestNamePlugin);

  hookEmitter.onTestRunComplete({ testResults });
  const runPromise = plugin.run({}, updateConfigAndRun);
  stdout.write.mockReset();
  type('f', 'o', KEYS.ENTER);
  expect(stdout.write.mock.calls.join('\n')).toMatchSnapshot();

  await runPromise;

  expect(updateConfigAndRun).toHaveBeenCalledWith({
    mode: 'watch',
    testNamePattern: 'fo',
  });
});
