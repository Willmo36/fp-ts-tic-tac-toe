import * as Option from "fp-ts/lib/Option";
import * as Array from "fp-ts/lib/Array";
import { Do } from "fp-ts-contrib/lib/Do";
import { pipe } from "fp-ts/lib/pipeable";
import { flow, identity } from "fp-ts/lib/function";
import * as STE from "fp-ts-contrib/lib/StateTaskEither";
import * as TE from "fp-ts/lib/TaskEither";
import * as Either from "fp-ts/lib/Either";
import * as Task from "fp-ts/lib/Task";
import Realine from "readline";
import { Show } from "fp-ts/lib/Show";

type Player = "x" | "o";

type GameState = {
  lastMove: Player;
  board: Board;
};

type CellState = Option.Option<Player>;

type Board = [
  CellState,
  CellState,
  CellState,
  CellState,
  CellState,
  CellState,
  CellState,
  CellState,
  CellState
];

type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
const showPosition: Show<Position> = {
  show: p => (p+1).toString()
}

const initialGameState: GameState = {
  lastMove: "o",
  board: [
    Option.none,
    Option.none,
    Option.none,
    Option.none,
    Option.none,
    Option.none,
    Option.none,
    Option.none,
    Option.none
  ]
};

const showCellState = (board: Board, position: Position) => pipe(
  board[position], 
  Option.fold(() => showPosition.show(position), identity)
);

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

function setGameState(gs: Board, position: Position, player: Player): Board {
  const update = (cellPos: Position) =>
    cellPos === position ? Option.some(player) : gs[cellPos];

  return [
    update(0),
    update(1),
    update(2),
    update(3),
    update(4),
    update(5),
    update(6),
    update(7),
    update(8)
  ];
}

/**
 * Try to commit the move, failing if the cell has already been taken
 */
function commitMove(
  gs: Board,
  position: Position,
  player: Player
): Either.Either<Position, Board> {
  if (Option.isSome(gs[position])) {
    return Either.left(position);
  }

  return Either.right(setGameState(gs, position, player));
}

function loop(gs: GameState): TE.TaskEither<any, GameState> {
  const player = gs.lastMove === "x" ? "o" : "x";
  console.clear();
  render(gs.board);

  return pipe(
    TE.taskEither.fromTask<any, string>(question("Choose cell: ")),
    TE.chain(position =>
      pipe(
        commitMove(gs.board, <Position>(Number(position) - 1), player),
        TE.fromEither,
        TE.map<Board, GameState>(board => ({ board, lastMove: player }))
      )
    ),
    TE.alt(() => loop(gs)),
    TE.chain(nextGS => {
      //if is complete stop
      return loop(nextGS);
    })
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
