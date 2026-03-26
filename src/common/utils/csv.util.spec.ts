import { csvHeader, csvRow, toCsv } from './csv.util';

describe('csv.util', () => {
    it('escapes commas and quotes', () => {
        const headers = ['a', 'b'];
        const rows = [{ a: 'hello,world', b: '"quoted"' }];
        const csv = toCsv(headers, rows);
        expect(csv).toContain('"hello,world"');
        expect(csv).toContain('""quoted""');
    });

    it('builds header and row', () => {
        const headers = ['id', 'name'];
        const row = { id: 1, name: 'test' };
        expect(csvHeader(headers)).toBe('id,name');
        expect(csvRow(headers, row)).toBe('1,test');
    });
});
