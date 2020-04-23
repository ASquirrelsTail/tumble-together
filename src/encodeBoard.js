import {urlEncode64} from './constants.js';

export default function encodeBoard(board) {
  let encodedBoard = ''

  board.forEach(row => {
    for (let position=0; position < row.length; position++) {
      if (!row[position]) {
        let restOfRow = row.slice(position + 1)
        let numberOfBlanks = restOfRow.findIndex(component => component);
        if (numberOfBlanks < 0) numberOfBlanks = restOfRow.length;
        encodedBoard += urlEncode64[numberOfBlanks];
        position += numberOfBlanks;
      } else {
        encodedBoard += urlEncode64[row[position].constructor.code[row[position].facing]];
      }
    }
  });
  return encodedBoard;
}
