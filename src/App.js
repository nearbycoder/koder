import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';

const defaultCode = `// Here you will write your code in the setup function.

// Functions to use
// up();    - moves ↑ 1
// down();  - moves ↓ 1
// left();  - moves ← 1
// right(); - moves → 1
// direction [LEFT | RIGHT | UP | DOWN]
// loop(direction, moveCount);

// func(() => {
//   up to three function calls;
// });

func(() => {
  loop(DOWN, 3);
  loop(RIGHT, 2);
  loop(DOWN, 3);
});

func(() => {
  loop(RIGHT, 5);
  loop(DOWN, 2);
  loop(RIGHT, 2);
});
`;

function Row({ row, columnIndex, map }) {
  return (
    <div className="flex">
      {row.map((block, index) => {
        const isPath = ['P', 'B', 'ER'].includes(block);
        const borders = ['P', 'B', 'W', 'ER', 'X'];

        const leftBorder = borders.includes(row[index - 1]);
        const rightBorder = borders.includes(row[index + 1]);
        const topBorder = borders.includes(
          map[columnIndex - 1] && map[columnIndex - 1][index]
        );
        const bottomBorder = borders.includes(
          map[columnIndex + 1] && map[columnIndex + 1][index]
        );

        const borderCss = `${!leftBorder ? 'border-l-1' : 'border-l-0'} ${
          !rightBorder ? 'border-r-1' : 'border-r-0'
        } ${!topBorder ? 'border-t-1' : 'border-t-0'} ${
          !bottomBorder ? 'border-b-1' : 'border-b-0'
        }`;

        return (
          <div
            key={index}
            className={`border border-gray-300 h-16 w-16 flex justify-center items-center text-teal-400 font-bold text-md ${
              isPath && 'bg-gray-200'
            } ${block === 'W' && 'bg-gray-800'} ${
              block === 'F' && 'bg-blue-600'
            } ${block === 'B' && 'bg-blue-600'} ${
              block === 'X' && 'bg-red-600'
            } ${borderCss}`}>
            {(block === 'P' || block === 'B' || block === 'X') && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-8 h-8"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {block === 'S' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                className="w-8 h-8 text-indigo-700"
                fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* prettier-ignore */
const defaultMap = [
  ['B', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'S', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'E', 'E', 'S', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'S', 'E', 'F'],
  ['E', 'E', 'E', 'W', 'W', 'W', 'E', 'E', 'E', 'E'],
]

let timeouts = [];

export default function App() {
  const [code, setCode] = useState(defaultCode);
  const [editor, setEditor] = useState(null);
  const [map, setMap] = useState(defaultMap);
  const [calls, setCalls] = useState(0);
  const [maxCalls, setMaxCalls] = useState(5);
  const [stars, setStars] = useState(0);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (editor) {
      const listener = document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          editor.getAction('editor.action.formatDocument').run();
          return;
        }
      });
      return () => document.removeEventListener('keydown', listener);
    }
  }, [editor]);

  useEffect(() => {
    if (calls > maxCalls) {
      setError('Max Calls Created');
      stop();
    }
  }, [calls, maxCalls, error]);

  function stop() {
    timeouts.forEach((timeout) => clearTimeout(timeout));
    timeouts = [];
  }

  function reset() {
    setMap(defaultMap);
    setStars(0);
    setCalls(0);
    setError(null);
    setRunning(false);
  }

  function evalCode() {
    reset();
    stop();
    setRunning(true);
    let errorMessage;

    const RIGHT = '__right';
    const LEFT = '__left';
    const UP = '__up';
    const DOWN = '__down';

    try {
      let internalCalls = 0;
      let totalFunctionCalls = 0;
      let timeBetweenCalls = 10;

      function move(moves, callback) {
        if (window.inFunction) {
          window.callsInFunction++;
        }
        if (!window.overrideCount) {
          totalFunctionCalls++;
        }
        setCalls(totalFunctionCalls);
        [...Array(moves).keys()].forEach((move) => {
          internalCalls++;
          callback();
        });
      }

      function up() {
        move(1, () => moveY(-1));
      }
      function down(moves = 1) {
        move(1, () => moveY(1));
      }
      function left(moves = 1) {
        move(1, () => moveX(-1));
      }
      function right(moves = 1) {
        move(1, () => moveX(1));
      }

      function __up(moves = 1) {
        move(moves, () => moveY(-1));
      }
      function __down(moves = 1) {
        move(moves, () => moveY(1));
      }
      function __left(moves = 1) {
        move(moves, () => moveX(-1));
      }
      function __right(moves = 1) {
        move(moves, () => moveX(1));
      }

      function loop(direction, count) {
        if (!window.inFunction) {
          totalFunctionCalls++;
        }

        window.overrideCount = true;
        eval(direction)(count);
        window.overrideCount = false;
      }

      function func(callback) {
        window.callsInFunction = 0;
        window.maxCallsInFunction = 3;
        window.inFunction = true;
        window.overrideCount = true;
        totalFunctionCalls++;
        callback();

        if (window.callsInFunction > window.maxCallsInFunction) {
          setError('Only 3 function calls in function allowed');
          stop();
        }

        window.inFunction = false;
        window.overrideCount = false;
      }

      function moveY(move) {
        const timeout = setTimeout(() => {
          if (errorMessage) {
            clearTimeout(timeout);
            return;
          }
          setMap((map) => {
            let playerXIndex, playerYIndex;
            map.forEach((row, columnIndex) => {
              row.forEach((block, rowIndex) => {
                if (block === 'P' || block === 'B') {
                  playerXIndex = rowIndex;
                  playerYIndex = columnIndex;
                }
              });
            });

            return map.map((row, columnIndex) => {
              return row.map((block, rowIndex) => {
                if (
                  playerXIndex === rowIndex &&
                  playerYIndex === columnIndex &&
                  !map[playerYIndex + move]
                ) {
                  setError('Invalid Move');
                  errorMessage = 'Invalid Move';
                  return 'X';
                }

                if (
                  playerYIndex === columnIndex &&
                  playerXIndex === rowIndex &&
                  map[playerYIndex + move] &&
                  map[playerYIndex + move][rowIndex] === 'W'
                ) {
                  setError('Blocked By Wall');
                  errorMessage = 'Blocked By Wall';
                  console.log('X');
                  return 'X';
                }

                if (block === 'W') {
                  return 'W';
                }

                if (playerXIndex === rowIndex && playerYIndex === columnIndex) {
                  return 'ER';
                }
                if (
                  playerXIndex === rowIndex &&
                  playerYIndex + move === columnIndex
                ) {
                  if (block === 'S') {
                    setStars((stars) => {
                      return stars + 1;
                    });
                  }

                  return 'P';
                }
                return block;
              });
            });
          });
        }, internalCalls * timeBetweenCalls);
        timeouts = [...timeouts, timeout];
      }

      function moveX(move) {
        const timeout = setTimeout(() => {
          if (errorMessage) {
            clearTimeout(timeout);
            return;
          }
          setMap((map) => {
            let playerXIndex, playerYIndex;
            map.forEach((row, columnIndex) => {
              row.forEach((block, rowIndex) => {
                if (block === 'P' || block === 'B') {
                  playerXIndex = rowIndex;
                  playerYIndex = columnIndex;
                }
              });
            });

            return map.map((row, columnIndex) => {
              return row.map((block, rowIndex) => {
                if (
                  playerYIndex === columnIndex &&
                  playerXIndex === rowIndex &&
                  !row[playerXIndex + move]
                ) {
                  setError('Invalid Move');
                  errorMessage = 'Invalid Move';
                  return 'X';
                }

                if (
                  playerYIndex === columnIndex &&
                  playerXIndex === rowIndex &&
                  row[playerXIndex + move] === 'W'
                ) {
                  setError('Blocked By Wall');
                  errorMessage = 'Blocked By Wall';
                  return 'X';
                }

                if (block === 'W') {
                  return 'W';
                }

                if (playerYIndex === columnIndex && playerXIndex === rowIndex) {
                  return 'ER';
                }

                if (
                  playerYIndex === columnIndex &&
                  playerXIndex + move === rowIndex
                ) {
                  if (block === 'S') {
                    setStars((stars) => {
                      return stars + 1;
                    });
                  }

                  return 'P';
                }
                return block;
              });
            });
          });
        }, internalCalls * timeBetweenCalls);
        timeouts = [...timeouts, timeout];
      }
      eval(code);
    } catch (error) {
      console.log(error);
      setError('Compiler Error, Please Try Again!');
    }
  }

  return (
    <div className="relative h-screen flex overflow-hidden">
      <div className="absolute right-0 top-0 m-4 z-10">
        {!running ? (
          <button
            onClick={evalCode}
            className="border rounded border-blue-500 text-blue-500 px-4 py-2 shadow-md mr-6">
            Run
          </button>
        ) : (
          <button
            onClick={() => {
              stop();
              reset();
            }}
            className="border rounded border-blue-500 text-blue-500 px-4 py-2 shadow-md mr-6">
            Reset
          </button>
        )}
        <button
          onClick={() => {
            stop();
          }}
          className="border rounded border-red-500 text-red-500 px-4 py-2 shadow-md">
          Stop
        </button>
      </div>
      <div className="w-1/2">
        <MonacoEditor
          height="100vh"
          language="javascript"
          theme="vs-dark"
          value={code}
          editorWillMount={(monaco) => {
            monaco.languages.registerDocumentFormattingEditProvider(
              'javascript',
              {
                provideDocumentFormattingEdits(model, options, token) {
                  try {
                    const text = window.prettier.format(model.getValue(), {
                      parser: 'babylon',
                      plugins: window.prettierPlugins,
                    });

                    return [
                      {
                        range: model.getFullModelRange(),
                        text,
                      },
                    ];
                  } catch (err) {
                    alert(err);
                  }
                },
              }
            );
          }}
          editorDidMount={(editor) => {
            editor.getModel().updateOptions({ tabSize: 2 });
            setEditor(editor);
          }}
          options={{
            selectOnLineNumbers: true,
            minimap: { enabled: false },
            fontSize: 18,
            useTabStops: false,
          }}
          onChange={(value) => {
            setCode(value);
          }}
        />
      </div>
      <div className="p-1 cursor-move bg-gray-800"></div>
      <div className="relative w-1/2 h-full">
        <div className="relative m-auto justify-center items-center h-full">
          <div className="items-start justify-start pt-5 pl-5 flex space-x-6">
            <div>Star Count: {stars}</div>
            <div>Call Count: {calls}</div>
            <div>Max Call Count: {maxCalls}</div>
            {calls > maxCalls && (
              <div className="text-red-600">You Lose, Please Try Again</div>
            )}
          </div>
          <div className="items-start justify-start pt-5 pl-5 flex space-x-6">
            {error && <div className="text-red-600">{error}</div>}
          </div>
          <div className="w-full flex flex-1 justify-center mt-16">
            <div>
              {map.map((row, index) => (
                <Row key={index} map={map} columnIndex={index} row={row}></Row>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
