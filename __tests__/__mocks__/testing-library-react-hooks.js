/**
 * @testing-library/react-hooks 最小化 Mock
 * 
 * @alpha: 该库已被弃用（合并入 @testing-library/react-native）。
 * 此 mock 使用 react-test-renderer 提供真实 React 渲染上下文。
 */
const React = require('react');
const TestRenderer = require('react-test-renderer');

function renderHook(callback) {
    const result = { current: null };
    let pendingCallback = callback;

    function TestComponent() {
        result.current = pendingCallback();
        return null;
    }

    let renderer;
    TestRenderer.act(() => {
        renderer = TestRenderer.create(React.createElement(TestComponent));
    });

    return {
        result,
        rerender: (newCallback) => {
            if (newCallback) pendingCallback = newCallback;
            TestRenderer.act(() => {
                renderer.update(React.createElement(TestComponent));
            });
        },
        unmount: () => {
            TestRenderer.act(() => {
                renderer.unmount();
            });
        },
    };
}

function act(callback) {
    TestRenderer.act(() => {
        callback();
    });
}

module.exports = {
    renderHook,
    act,
};
