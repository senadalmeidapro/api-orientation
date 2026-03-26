import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { AuditService } from '../../common/audit/audit.service';

const makeRes = () => {
    const res: any = {};
    res.setHeader = jest.fn();
    res.status = jest.fn().mockReturnValue(res);
    res.write = jest.fn();
    res.end = jest.fn();
    return res;
};

describe('ContactController', () => {
    it('streams export', async () => {
        const service = {
            listBatch: jest
                .fn()
                .mockResolvedValueOnce([
                    {
                        id: 1,
                        name: 'A',
                        email: 'a@b.com',
                        requestType: 'INFO',
                        message: 'x',
                        status: 'OPEN',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ])
                .mockResolvedValueOnce([]),
        } as unknown as ContactService;
        const audit = { logAction: jest.fn() } as unknown as AuditService;
        const controller = new ContactController(service, audit);
        const res = makeRes();

        await controller.export({ format: 'csv' } as any, res);

        expect(res.setHeader).toHaveBeenCalled();
        expect(res.write).toHaveBeenCalled();
        expect(res.end).toHaveBeenCalled();
    });

    it('updates and logs audit', async () => {
        const service = {
            update: jest.fn().mockResolvedValue({ id: 1 }),
        } as unknown as ContactService;
        const audit = { logAction: jest.fn().mockResolvedValue({}) } as unknown as AuditService;
        const controller = new ContactController(service, audit);

        await controller.update('1', { status: 'CLOSED' } as any, { id: 'admin1' }, {
            ip: '1.1.1.1',
            headers: { 'user-agent': 'jest' },
        } as any);

        expect(service.update).toHaveBeenCalled();
        expect(audit.logAction).toHaveBeenCalled();
    });
});
