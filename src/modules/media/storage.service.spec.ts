import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';

describe('StorageService', () => {
  it('writes locally when S3 disabled', async () => {
    const service = new StorageService();
    const res = await service.uploadBuffer(Buffer.from('test'), 'application/pdf', 'test-files');
    const filePath = path.join(process.cwd(), res);

    expect(fs.existsSync(filePath)).toBe(true);

    fs.unlinkSync(filePath);
  });
});
