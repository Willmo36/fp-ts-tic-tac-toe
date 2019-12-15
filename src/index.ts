import * as Option from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as Task from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import Realine from "readline";
import { Board, commitMove, GameState, initialGameState, Position, showCellState, findWinner } from "./GameState";


const rl = Realine.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q: string): Task.Task<string> => () => {
  return new Promise(res =>
    rl.question(q, answer => {
      rl.pause();
      res(answer);
    })
  );
};



function loop(gs: GameState): TE.TaskEither<any, GameState> {
  const player = gs.lastMove === "x" ? "o" : "x";
  console.clear();
  render(gs.board);
  return pipe(
    TE.taskEither.fromTask<any, string>(
      question(`Choose cell, Player ${player}:`)
    ),
    TE.chain(position =>
      pipe(
        commitMove(gs.board, <Position>(Number(position) - 1), player),
        TE.fromEither,
        TE.map<Board, GameState>(board => ({ board, lastMove: player }))
      )
    ),
    TE.alt(() => loop(gs)),
    TE.chain(nextGS =>
      pipe(
        nextGS,
        findWinner,
        Option.fold(
          () => loop(nextGS),
          winner => {
            render(nextGS.board);
            console.log(`Player ${winner} wins!`);
            process.exit();
            return TE.taskEitherSeq.of(nextGS);
          }
        )
      )
    )
  );
}

//credit to https://flaviocopes.com/javascript-template-literals/
const renderBoard = (board: Board) => (
  literals: TemplateStringsArray,
  ...positions: Position[]
) => {
  return (
    positions.reduce((acc, pos, i) => {
      return acc + literals[i] + ` ${showCellState(board, pos)}  `;
    }, "") + literals[9]
  );
};

function render(gs: Board) {
  const frame = renderBoard(gs)`
   _____________________________
  |         |         |         |
  |   ${0}  |   ${1}  |   ${2}  |
  |_________|_________|_________|
  |         |         |         |
  |   ${3}  |   ${4}  |   ${5}  |
  |_________|_________|_________|
  |         |         |         |
  |   ${6}  |   ${7}  |   ${8}  |
  |_________|_________|_________|
    `;

  console.log(frame);
}

loop(initialGameState)();
