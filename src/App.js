import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';

const defaultCode = `
// Here you will write your code in the setup function.

// Functions to use
// up();
// down();
// left();
// right();

function setup() {
  right();
  right();
  down();
  down();
  down();
  down();
  down();
  down();
  right();
  right();
  right();
  right();
  right();
  down();
  down();
  right();
  right();
}

setup();
`;

function Row({ row }) {
  return (
    <div className="flex">
      {row.map((block, index) => {
        const isPath = ['P', 'S', 'R'].includes(block);

        return (
          <div
            key={index}
            className={`border border-gray-300 h-16 w-16 flex justify-center items-center text-teal-400 font-bold text-md ${
              isPath && 'bg-gray-200'
            }`}>
            {block === 'P' && (
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
  ['P', 'S', 'R', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'R', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'R', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'S', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'R', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'R', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
  ['E', 'E', 'R', 'R', 'R', 'S', 'R', 'R', 'E', 'E'],
  ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'R', 'E', 'E'],
  ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'S', 'R', 'R'],
  ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
]

export default function App() {
  const [code, setCode] = useState(defaultCode);
  const [map, setMap] = useState(defaultMap);
  const [calls, setCalls] = useState(0);
  const [maxCalls, setMaxCalls] = useState(20);
  const [stars, setStars] = useState(0);
  const options = {
    selectOnLineNumbers: true,
    fontSize: 18,
  };

  function evalCode() {
    setMap(defaultMap);
    setStars(0);
    setCalls(0);

    try {
      eval(`
    let internalCalls = 0;
    let timeBetweenCalls = 250;

    function up() {
      internalCalls++
      moveY(-1);
    }
    function down() {
      internalCalls++
      moveY(1);
    }

    function left() {
      internalCalls++
      moveX(-1);
    }
    function right() {
      internalCalls++
      moveX(1);
    }

    function moveY(move) {
      setTimeout(() => {
        console.log(move === 1 ? 'down': 'up');
        setCalls((calls) => calls + 1);
        setMap((map) => {
          let playerXIndex, playerYIndex;
          map.forEach((row, columnIndex) => {
            row.forEach((block, rowIndex) => {
              if (block === 'P') {
                playerXIndex = rowIndex
                playerYIndex = columnIndex
              }
            })
          })

          return map.map((row, columnIndex) => {
            return row.map((block, rowIndex) => {
              if (playerXIndex === rowIndex && playerYIndex === columnIndex && !map[playerYIndex + move]) {
                console.log('invalid move');
                return 'P';
              }

              if (playerXIndex === rowIndex && playerYIndex === columnIndex) {
                return 'E';
              }
              if (playerXIndex === rowIndex && playerYIndex + move === columnIndex) {
                if (block === 'S') {
                  setStars((stars) => {
                    return stars + 0.5
                  });
                }
                
                return 'P';
              }
              return block;
            })
          })
        })
      },internalCalls * timeBetweenCalls);
    }

    function moveX(move) {
      setTimeout(() => {
        console.log(move === 1 ? 'right': 'left');
        setCalls((calls) => calls + 1);
        setMap((map) => {
          let playerXIndex, playerYIndex;
          map.forEach((row, columnIndex) => {
            row.forEach((block, rowIndex) => {
              if (block === 'P') {
                playerXIndex = rowIndex
                playerYIndex = columnIndex
              }
            })
          })

          return map.map((row, columnIndex) => {
            return row.map((block, rowIndex) => {
              if (playerYIndex === columnIndex && playerXIndex === rowIndex && !row[playerXIndex + move]) {
                console.log('invalid move');
                return 'P';
              }

              if (playerYIndex === columnIndex && playerXIndex === rowIndex) {
                return 'E';
              }
              if (playerYIndex === columnIndex && playerXIndex + move === rowIndex) {
                if (block === 'S') {
                  setStars((stars) => {
                    return stars + 0.5
                  });
                }

                return 'P';
              }
              return block;
            })
          })
        })
      },internalCalls * timeBetweenCalls);
    }
    
    ${code};
    `);
    } catch (error) {
      console.log('compile error');
    }
  }

  return (
    <div className="relative h-screen flex overflow-hidden">
      <div className="absolute right-0 top-0 m-4 z-10">
        <button
          onClick={evalCode}
          className="border rounded border-red-500 text-red-500 px-4 py-2 shadow-md">
          Run
        </button>
        {calls > maxCalls && <div>You Lose, Please Try Again</div>}
        <div>Star Count: {stars}</div>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100vh"
          width="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          options={options}
          onChange={(value) => {
            setCode(value);
          }}
        />
      </div>
      <div className="relative w-full flex-1 m-auto justify-center items-center">
        <div className="w-full flex justify-center items-center">
          <div>
            {map.map((row, index) => (
              <Row key={index} row={row}></Row>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
