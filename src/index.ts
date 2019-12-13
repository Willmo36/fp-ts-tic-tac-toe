import * as Option from "fp-ts/lib/Option";
import * as Array from "fp-ts/lib/Array";
import { Do } from "fp-ts-contrib/lib/Do";
import { pipe } from "fp-ts/lib/pipeable";
import { flow, identity } from "fp-ts/lib/function";

type Player = "x" | "o";
type CellState = Option.Option<Player>;

type GameState = [
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

const initialGameState: GameState = [
  Option.none,
  Option.none,
  Option.none,
  Option.none,
  Option.none,
  Option.none,
  Option.none,
  Option.none,
  Option.none,
];


const showCellState = Option.fold(() => " ", identity);

function setGameState(
  gs: GameState,
  position: Position,
  player: Player
): GameState {
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
  gs: GameState,
  position: Position,
  player: Player
): Option.Option<GameState> {
  if (Option.isSome(gs[position])) {
    return Option.none;
  }

  return Option.some(setGameState(gs, position, player));
}

function loop(gs: GameState){


}


//credit to https://flaviocopes.com/javascript-template-literals/
const drawGrid = (gs: GameState) => (literals: TemplateStringsArray, ...positions: Position[]) => {
  return positions.reduce((acc, pos, i) => {
    return acc + literals[i] + ` ${showCellState(gs[pos])}  `;
  }, "")+ literals[9];
};


function render(gs: GameState) {
  const frame = drawGrid(gs)`
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
};

render(initialGameState)