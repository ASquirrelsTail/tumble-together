import {urlEncode64} from './constants.js';
import components from './components.js';

export default function createBoard(boardCode=null) {
  let board = [...Array(11)];
  if (boardCode) {
    if (!/^[a-zA-Z0-9-_]*$/.test(boardCode)) throw 'Code is not base64 url encoded!'
    else if (boardCode.length < 11) throw 'Code is too short!'
    else{
      let position = 0;
      const componentsList = Object.values(components)
      board = board.map(() => {
        let row = [];
        while (row.length < 11 && position < boardCode.length) {
          let code = urlEncode64.indexOf(boardCode[position]);
          if (code < 11) row.push(...Array(code + 1));
          else {
            let componentClass = componentsList.find(component => component.code.includes(code));
            if (componentClass) row.push(new componentClass(componentClass.code.indexOf(code)));
            else throw 'Invalid code!'
          }
          position++;
        }
        return row;
      });
    }
  } else board = board.map(() => Array(11));
  return board;
}
