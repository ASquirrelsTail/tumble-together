import createBoard from '../src/createBoard.js';
import encodeBoard from '../src/encodeBoard.js';

describe('createBoard', () => {
    it('should return an empty 11x11 array', () => {
      let board = createBoard()

      expect(typeof board).toBe(typeof []);
      expect(board).toHaveLength(11);

      board.forEach((row) => {
        expect(typeof row).toBe(typeof []);
        expect(row).toHaveLength(11);

        row.forEach((position) => {
          expect(position).toBeFalsy();
        });
      });
    });

    it('should raise an error if the code is not base64 encoded', () => {
      expect(() => {createBoard('a[5]a;a0aaaa')}).toThrow();
    });

    it('should raise an error if the code is too short', () => {
      expect(() => {createBoard('1U654')}).toThrow();
    });

    it('should raise an error if the code contains unused chracters', () => {
      expect(() => {createBoard('1U654xaaaaaaaa')}).toThrow();
    });

    it('should return an empty 11x11 array with code "aaaaaaaaaaa"', () => {
      let board = createBoard('aaaaaaaaaaa')

      expect(typeof board).toBe(typeof []);
      expect(board).toHaveLength(11);

      board.forEach((row) => {
        expect(typeof row).toBe(typeof []);
        expect(row).toHaveLength(11);

        row.forEach((position) => {
          expect(position).toBeFalsy()
        });
      });
    });

    it('should re-encode to the same input', () => {
      let board = createBoard('aaaaaaaaaaa');
      expect(encodeBoard(board)).toBe('aaaaaaaaaaa');
      board = createBoard('aaaST8aaaaaaa');
      expect(encodeBoard(board)).toBe('aaaST8aaaaaaa');
    });
});
