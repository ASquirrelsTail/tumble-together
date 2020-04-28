import Board from '../src/boardUtils.js';

describe('Board.create()', () => {
    it('should return an empty 11x11 array', () => {
      let board = Board.create()

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
      expect(() => {Board.create('a[5]a;a0aaaa')}).toThrow();
    });

    it('should raise an error if the code is too short', () => {
      expect(() => {Board.create('1U654')}).toThrow();
    });

    it('should raise an error if the code contains unused chracters', () => {
      expect(() => {Board.create('1U654xaaaaaaaa')}).toThrow();
    });

    it('should return an empty 11x11 array with code "aaaaaaaaaaa"', () => {
      let board = Board.create('aaaaaaaaaaa')

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
      let board = Board.create('aaaaaaaaaaa');
      expect(board.encode()).toBe('aaaaaaaaaaa');
      board = Board.create('aaaST8aaaaaaa');
      expect(board.encode()).toBe('aaaST8aaaaaaa');
    });
});
