import * as Option from "fp-ts/lib/Option";
import * as Either from "fp-ts/lib/Either";
import * as Array from "fp-ts/lib/Array";
import { Show } from "fp-ts/lib/Show";
import { pipe } from "fp-ts/lib/pipeable";
import { identity } from "fp-ts/lib/function";
import { Eq } from "fp-ts/lib/Eq";

export type Player = "x" | "o";
const eqPlayer: Eq<Player> ={
  equals: (a,b) => a === b
}

export type GameState = {
  lastMove: Player;
  board: Board;
};

export type CellState = Option.Option<Player>;

export type Board = [
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

export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const showPosition: Show<Position> = {
  show: p => (p + 1).toString()
};

export const initialGameState: GameState = {
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

export const showCellState = (board: Board, position: Position) =>
  pipe(
    board[position],
    Option.fold(() => showPosition.show(position), identity)
  );

export function setGameState(
  gs: Board,
  position: Position,
  player: Player
): Board {
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
export function commitMove(
  gs: Board,
  position: Position,
  player: Player
): Either.Either<Position, Board> {
  if (Option.isSome(gs[position])) {
    return Either.left(position);
  }

  return Either.right(setGameState(gs, position, player));
}

type WinningShape = [Position, Position, Position];
export const findWinner = (gs: GameState): Option.Option<Player> => {
  const winningTripples: WinningShape[] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [3, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
  ];

  const eqPlayerArray = Array.getEq(eqPlayer);
  const checkTripple = (ws: WinningShape) =>
    pipe(
      Array.array.sequence(Option.option)([
        gs.board[ws[0]],
        gs.board[ws[1]],
        gs.board[ws[2]]
      ]),
      Option.chain(cellPlayers => {
        if(eqPlayerArray.equals(['x', 'x', 'x'], cellPlayers)){
          return Option.some<Player>('x');
        }
        
        if(eqPlayerArray.equals(['o', 'o', 'o'], cellPlayers)){
          return Option.some<Player>('o');
        }

        return Option.none;
      })
    );

    const winner = pipe(
      winningTripples,
      Array.map(checkTripple),
      Array.findFirst(Option.isSome),
      Option.chain(identity) //Mona join
    )

    return winner;
};
